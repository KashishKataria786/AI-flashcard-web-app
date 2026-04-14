import Deck from '../models/Deck.js';
import Flashcard from '../models/Flashcard.js';
import ReviewState from '../models/ReviewState.js';
import ReviewLog from '../models/ReviewLog.js';
import mongoose from 'mongoose';
import { chunkText } from '../services/pdfService.js';
import { generateFlashcardsFromChunk } from '../services/huggingFaceService.js';
import { generateDeckPDF } from '../services/pdfExportService.js';

/**
 * GET /api/decks
 * Fetches all decks for the authenticated user along with their associated cards.
 */
export const getAllDecks = async (req, res) => {
  try {
    const userId = req.user._id;
    const decks = await Deck.find({ ownerId: userId }).sort({ createdAt: -1 });
    
    // 1. Get 7-day activity for ALL decks in one aggregation for efficiency
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activityLogs = await ReviewLog.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            deckId: "$deckId", 
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } 
          }
        }
      }
    ]);

    const decksWithCards = await Promise.all(decks.map(async (deck) => {
      const cards = await Flashcard.find({ deckId: deck._id });
      
      // Calculate Mastery & Studied Percentages
      const reviewStates = await ReviewState.find({ deckId: deck._id, userId });
      const masteredCount = reviewStates.filter(s => s.status === 'Mastered').length;
      const studiedCount = reviewStates.length; // Any card with a state has been seen/studied

      const masteryScore = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;
      const studiedScore = cards.length > 0 ? Math.round((studiedCount / cards.length) * 100) : 0;

      // Calculate 7-day activity array
      const deckActivity = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const isActive = activityLogs.some(log => 
          log._id.deckId.toString() === deck._id.toString() && 
          log._id.day === dateStr
        );
        deckActivity.push(isActive);
      }

      return { ...deck.toObject(), cards, masteryScore, studiedScore, activity: deckActivity };
    }));

    res.status(200).json(decksWithCards);
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ message: 'Server error while fetching decks.' });
  }
};

/**
 * GET /api/decks/:id
 * Fetches a single deck by ID.
 */
export const getDeckById = async (req, res) => {
    try {
      const deck = await Deck.findById(req.params.id);
      if (!deck) return res.status(404).json({ message: 'Deck not found' });
      if (deck.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. This deck does not belong to you.' });
      }
      res.status(200).json(deck);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/decks/:id/regenerate
 * Re-runs the generation pipeline using the stored sourceText.
 * Deletes all old cards and review stats for this deck.
 */
export const regenerateDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await Deck.findById(id);

    if (!deck) {
      return res.status(404).json({ message: 'Deck not found.' });
    }

    if (deck.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This deck does not belong to you.' });
    }

    if (!deck.sourceText || deck.sourceText.length < 50) {
      return res.status(400).json({ message: 'This deck does not have enough source text to regenerate.' });
    }

    const requestedCards = deck.generationOptions?.targetCount || 10;
    
    console.log(`[Regeneration] Starting for deck "${deck.title}" — Target: ${requestedCards}`);

    const chunks = chunkText(deck.sourceText, 4000, 300);
    if (chunks.length === 0) {
      return res.status(400).json({ message: 'Could not extract chunks from stored text.' });
    }

    const cardsPerChunk = Math.max(1, Math.ceil(requestedCards / chunks.length));
    const generatedCardSets = [];
    const BATCH_SIZE = 2;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(chunk => generateFlashcardsFromChunk(chunk, cardsPerChunk))
      );
      generatedCardSets.push(...batchResults);
    }

    const flatCards = generatedCardSets.flat();
    const validCards = flatCards
      .filter(card =>
        card &&
        (card.type === 'Memorize' || card.type === 'QA') &&
        typeof card.front === 'string' && card.front.trim().length > 0 &&
        typeof card.back === 'string' && card.back.trim().length > 0
      )
      .slice(0, requestedCards);

    if (validCards.length === 0) {
      return res.status(500).json({ message: 'AI failed to regenerate flashcards.' });
    }

    await Flashcard.deleteMany({ deckId: id });
    await ReviewState.deleteMany({ deckId: id });

    const flashcardsToInsert = validCards.map(card => ({
      deckId: id,
      type: card.type,
      front: card.front.trim(),
      back: card.back.trim(),
    }));

    await Flashcard.insertMany(flashcardsToInsert);
    console.log(`[Regeneration] Success! "${deck.title}" updated.`);

    return res.status(200).json({
      message: 'Deck regenerated successfully!',
      cards: flashcardsToInsert,
      totalCards: flashcardsToInsert.length
    });
  } catch (error) {
    console.error('Error during regeneration:', error);
    res.status(500).json({ message: 'Server error during regeneration.' });
  }
};

/**
 * DELETE /api/decks/:id
 * Deletes a deck and all associated flashcards and review stats.
 */
export const deleteDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await Deck.findById(id);

    if (!deck) {
      return res.status(404).json({ message: 'Deck not found.' });
    }

    if (deck.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This deck does not belong to you.' });
    }

    await Flashcard.deleteMany({ deckId: id });
    await ReviewState.deleteMany({ deckId: id });
    await Deck.findByIdAndDelete(id);

    console.log(`[Deletion] Deck "${deck.title}" deleted.`);

    return res.status(200).json({ message: 'Deck deleted successfully.' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ message: 'Server error during deletion.' });
  }
};

/**
 * GET /api/decks/:id/export
 * Generates and downloads a PDF of the flashcards in a deck.
 */
export const exportDeckToPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await Deck.findById(id);

    if (!deck) {
      return res.status(404).json({ message: 'Deck not found.' });
    }

    if (deck.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This deck does not belong to you.' });
    }

    const cards = await Flashcard.find({ deckId: id });

    if (!cards || cards.length === 0) {
      return res.status(400).json({ message: 'This deck has no cards to export.' });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${deck.title.replace(/\s+/g, '_')}_Flashcards.pdf`);

    // Generate and stream PDF
    generateDeckPDF(deck, cards, res);

  } catch (error) {
    console.error('Error exporting deck to PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error during PDF export.' });
    }
  }
};
/**
 * GET /api/decks/search?q=...
 * Searches decks by title, tags, OR flashcard content (front/back).
 */
export const searchDecks = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    console.log(`[Search] Query: "${q}" received from User: ${userId}`);

    const regex = new RegExp(q, 'i');

    // 1. Find cards matching the query
    const matchingCards = await Flashcard.find({
      $or: [
        { front: regex },
        { back: regex }
      ]
    }).select('deckId');

    const cardDeckIds = [...new Set(matchingCards.map(c => c.deckId.toString()))];

    // 2. Find decks matching the query (Title, Tags, or contains matching cards)
    const matchingDecks = await Deck.find({
      ownerId: userId,
      $or: [
        { title: regex },
        { tags: regex },
        { _id: { $in: cardDeckIds } }
      ]
    }).sort({ createdAt: -1 });

    // 3. Get 7-day activity for these matches
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activityLogs = await ReviewLog.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          deckId: { $in: matchingDecks.map(d => d._id) },
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            deckId: "$deckId", 
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } 
          }
        }
      }
    ]);

    // 4. Populate cards, mastery, and activity for the frontend
    const decksWithCards = await Promise.all(matchingDecks.map(async (deck) => {
      const cards = await Flashcard.find({ deckId: deck._id });
      
      // Calculate Mastery & Studied Percentages for search results
      const reviewStates = await ReviewState.find({ deckId: deck._id, userId });
      const masteredCount = reviewStates.filter(s => s.status === 'Mastered').length;
      const studiedCount = reviewStates.length;

      const masteryScore = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;
      const studiedScore = cards.length > 0 ? Math.round((studiedCount / cards.length) * 100) : 0;

      // Calculate 7-day activity array
      const deckActivity = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const isActive = activityLogs.some(log => 
          log._id.deckId.toString() === deck._id.toString() && 
          log._id.day === dateStr
        );
        deckActivity.push(isActive);
      }

      return { ...deck.toObject(), cards, masteryScore, studiedScore, activity: deckActivity };
    }));

    res.status(200).json(decksWithCards);
  } catch (error) {
    console.error('Error searching decks:', error);
    res.status(500).json({ message: 'Server error during search.' });
  }
};
