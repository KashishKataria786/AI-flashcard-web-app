import Deck from '../models/Deck.js';
import Flashcard from '../models/Flashcard.js';
import ReviewState from '../models/ReviewState.js';
import { chunkText } from '../services/pdfService.js';
import { generateFlashcardsFromChunk } from '../services/huggingFaceService.js';

/**
 * GET /api/decks
 * Fetches all decks for the authenticated user along with their associated cards.
 */
export const getAllDecks = async (req, res) => {
  try {
    const userId = req.user._id;
    const decks = await Deck.find({ ownerId: userId }).sort({ createdAt: -1 });
    
    // Embed the actual flashcards into each deck object so the frontend can calculate counts/types
    const decksWithCards = await Promise.all(decks.map(async (deck) => {
      const cards = await Flashcard.find({ deckId: deck._id });
      return { ...deck.toObject(), cards };
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
