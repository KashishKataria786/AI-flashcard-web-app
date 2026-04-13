import Deck from '../models/Deck.js';
import Flashcard from '../models/Flashcard.js';
import { extractTextFromPDF, chunkText } from '../services/pdfService.js';
import { generateFlashcardsFromChunk } from '../services/huggingFaceService.js';

/**
 * POST /api/ingestion/pdf
 * Accepts a multipart/form-data PDF upload.
 * Extracts text, chunks it, generates mixed Memorize+QA flashcards via LLM, saves to DB.
 */
export const processPDFUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a valid PDF file.' });
    }

    const { targetCount, deckTitle } = req.body;
    const requestedCards = Math.min(parseInt(targetCount, 10) || 10, 50); // Hard cap at 50
    const title = deckTitle?.trim() || req.file.originalname.replace(/\.pdf$/i, '');

    console.log(`[Ingestion] Processing "${title}" — target: ${requestedCards} cards`);

    // Step 1: Extract text from PDF buffer
    const rawText = await extractTextFromPDF(req.file.buffer);

    if (!rawText || rawText.trim().length < 100) {
      return res.status(400).json({ message: 'PDF appears to be empty or image-only (no extractable text).' });
    }

    // Step 2: Smart-chunk the text
    const chunks = chunkText(rawText, 4000, 300);
    console.log(`[Ingestion] Chunked into ${chunks.length} segment(s)`);

    if (chunks.length === 0) {
      return res.status(400).json({ message: 'Could not extract meaningful text from the PDF.' });
    }

    // Step 3: Calculate cards per chunk (distribute evenly across document)
    const cardsPerChunk = Math.max(1, Math.ceil(requestedCards / chunks.length));

    // Step 4: Process in batches of 2 to avoid memory exhaustion (heap OOM)
    const generatedCardSets = [];
    const BATCH_SIZE = 2;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(chunk => generateFlashcardsFromChunk(chunk, cardsPerChunk))
      );
      generatedCardSets.push(...batchResults);
      console.log(`[Ingestion] Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
    }

    // Step 5: Flatten, validate schema, and trim to requested count
    const flatCards = generatedCardSets.flat();

    const validCards = flatCards
      .filter(card =>
        card &&
        (card.type === 'Memorize' || card.type === 'QA') &&
        typeof card.front === 'string' && card.front.trim().length > 0 &&
        typeof card.back === 'string' && card.back.trim().length > 0
      )
      .slice(0, requestedCards);

    console.log(`[Ingestion] Valid cards after sanitization: ${validCards.length}`);

    if (validCards.length === 0) {
      return res.status(500).json({
        message: 'AI failed to generate valid flashcards. Try a different PDF or reduce the card count.'
      });
    }

    // Step 6: Save Deck + Flashcards to MongoDB
    const ownerId = req.user?._id || '65f0b1a20c3d5e0f1a2b3c4d'; // fallback for dev without auth

    const newDeck = await Deck.create({
      title,
      ownerId,
      tags: ['ai-generated', 'pdf-ingestion'],
      sourceText: rawText,
      generationOptions: { targetCount: requestedCards }
    });

    const flashcardsToInsert = validCards.map(card => ({
      deckId: newDeck._id,
      type: card.type,
      front: card.front.trim(),
      back: card.back.trim(),
    }));

    await Flashcard.insertMany(flashcardsToInsert);

    console.log(`[Ingestion] Saved deck "${title}" with ${flashcardsToInsert.length} cards`);

    return res.status(201).json({
      message: 'Deck successfully created from PDF!',
      deck: { ...newDeck.toObject(), cards: flashcardsToInsert },
      totalCards: flashcardsToInsert.length,
      breakdown: {
        memorize: flashcardsToInsert.filter(c => c.type === 'Memorize').length,
        qa: flashcardsToInsert.filter(c => c.type === 'QA').length,
      }
    });

  } catch (error) {
    console.error('Error in processPDFUpload:', error);
    res.status(500).json({ message: 'Server error during ingestion. Please try again.' });
  }
};

/**
 * POST /api/ingestion/text
 * Accepts a JSON body with text, targetCount, and deckTitle.
 * Chunks it, generates mixed Memorize+QA flashcards via LLM, saves to DB.
 */
export const processTextUpload = async (req, res) => {
  try {
    const { text, targetCount, deckTitle } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return res.status(400).json({ message: 'Please provide valid text (minimum 50 characters) to generate flashcards.' });
    }

    const requestedCards = Math.min(parseInt(targetCount, 10) || 10, 50); // Hard cap at 50
    const title = deckTitle?.trim() || 'Text Input Flashcards';

    console.log(`[Ingestion] Processing text "${title}" — target: ${requestedCards} cards`);

    const rawText = text.trim();

    // Step 2: Smart-chunk the text
    const chunks = chunkText(rawText, 4000, 300);
    console.log(`[Ingestion] Chunked into ${chunks.length} segment(s)`);

    if (chunks.length === 0) {
      return res.status(400).json({ message: 'Could not extract meaningful text for generation.' });
    }

    // Step 3: Calculate cards per chunk (distribute evenly across document)
    const cardsPerChunk = Math.max(1, Math.ceil(requestedCards / chunks.length));

    // Step 4: Process in batches of 2 to avoid memory exhaustion (heap OOM)
    const generatedCardSets = [];
    const BATCH_SIZE = 2;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(chunk => generateFlashcardsFromChunk(chunk, cardsPerChunk))
      );
      generatedCardSets.push(...batchResults);
      console.log(`[Ingestion] Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
    }

    // Step 5: Flatten, validate schema, and trim to requested count
    const flatCards = generatedCardSets.flat();

    const validCards = flatCards
      .filter(card =>
        card &&
        (card.type === 'Memorize' || card.type === 'QA') &&
        typeof card.front === 'string' && card.front.trim().length > 0 &&
        typeof card.back === 'string' && card.back.trim().length > 0
      )
      .slice(0, requestedCards);

    console.log(`[Ingestion] Valid cards after sanitization: ${validCards.length}`);

    if (validCards.length === 0) {
      return res.status(500).json({
        message: 'AI failed to generate valid flashcards. Try different text or reduce the card count.'
      });
    }

    // Step 6: Save Deck + Flashcards to MongoDB
    const ownerId = req.user?._id || '65f0b1a20c3d5e0f1a2b3c4d'; // fallback for dev without auth

    const newDeck = await Deck.create({
      title,
      ownerId,
      tags: ['ai-generated', 'text-ingestion'],
      sourceText: rawText,
      generationOptions: { targetCount: requestedCards }
    });

    const flashcardsToInsert = validCards.map(card => ({
      deckId: newDeck._id,
      type: card.type,
      front: card.front.trim(),
      back: card.back.trim(),
    }));

    await Flashcard.insertMany(flashcardsToInsert);

    console.log(`[Ingestion] Saved deck "${title}" with ${flashcardsToInsert.length} cards`);

    return res.status(201).json({
      message: 'Deck successfully created from text!',
      deck: { ...newDeck.toObject(), cards: flashcardsToInsert },
      totalCards: flashcardsToInsert.length,
      breakdown: {
        memorize: flashcardsToInsert.filter(c => c.type === 'Memorize').length,
        qa: flashcardsToInsert.filter(c => c.type === 'QA').length,
      }
    });

  } catch (error) {
    console.error('Error in processTextUpload:', error);
    res.status(500).json({ message: 'Server error during ingestion. Please try again.' });
  }
};


export const processTextUploadAgain = async (req, res) => {
  try {
    const { text, targetCount, deckTitle } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return res.status(400).json({ message: 'Please provide valid text (minimum 50 characters) to generate flashcards.' });
    }
    
    const requestedCards = Math.min(parseInt(targetCount, 10) || 10, 50); // Hard cap at 50
    const title = deckTitle?.trim() || 'Text Input Flashcards';

    console.log(`[Ingestion] Processing text directly "${title}" — target: ${requestedCards} cards`);

    // Strictly limit text to 10,000 characters (~2,500 tokens) to prevent HF Inference payload rejection
    // Since we are forcing a bypass of the chunking mechanism, this is required.
    let rawText = text.trim();
    if (rawText.length > 10000) {
      console.log(`[Ingestion] Text too long (${rawText.length} chars). Truncating to 10,000 to respect LLM context window limits.`);
      rawText = rawText.slice(0, 10000);
    }

    // Bypass chunking and send the entire text to the LLM
    const generatedCards = await generateFlashcardsFromChunk(rawText, requestedCards);

    // Validate schema, and trim to requested count
    const validCards = generatedCards
      .filter(card =>
        card &&
        (card.type === 'Memorize' || card.type === 'QA') &&
        typeof card.front === 'string' && card.front.trim().length > 0 &&
        typeof card.back === 'string' && card.back.trim().length > 0
      )
      .slice(0, requestedCards);

    console.log(`[Ingestion] Valid cards after sanitization: ${validCards.length}`);

    if (validCards.length === 0) {
      return res.status(500).json({
        message: 'AI failed to generate valid flashcards. Try different text or reduce the card count.'
      });
    }

    // Save Deck + Flashcards to MongoDB
    const ownerId = req.user?._id || '65f0b1a20c3d5e0f1a2b3c4d'; // fallback for dev without auth

    const newDeck = await Deck.create({
      title,
      ownerId,
      tags: ['ai-generated', 'text-ingestion', 'direct-generation'],
      sourceText: rawText,
      generationOptions: { targetCount: requestedCards }
    });

    const flashcardsToInsert = validCards.map(card => ({
      deckId: newDeck._id,
      type: card.type,
      front: card.front.trim(),
      back: card.back.trim(),
    }));

    await Flashcard.insertMany(flashcardsToInsert);

    console.log(`[Ingestion] Saved deck "${title}" with ${flashcardsToInsert.length} cards`);

    return res.status(201).json({
      message: 'Deck successfully created from text directly!',
      deck: { ...newDeck.toObject(), cards: flashcardsToInsert },
      totalCards: flashcardsToInsert.length,
      breakdown: {
        memorize: flashcardsToInsert.filter(c => c.type === 'Memorize').length,
        qa: flashcardsToInsert.filter(c => c.type === 'QA').length,
      }
    });

  } catch (error) {
    console.error('Error in processTextUploadAgain:', error);
    res.status(500).json({ message: 'Server error during ingestion. Please try again.' });
  }
};

/**
 * POST /api/ingestion/parse-pdf
 * Alternate controller that ONLY extracts and returns PDF text for verification and screening.
 * Does not hit the database or LLM limits.
 */
export const parsePDFOnly = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a valid PDF file.' });
    }

    const title = req.file.originalname || 'Uploaded Document';
    console.log(`[Parse Only] Extracting text directly from "${title}"`);

    const rawText = await extractTextFromPDF(req.file.buffer);

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ message: 'PDF appears to be empty or image-only (no extractable text).' });
    }

    return res.status(200).json({
      message: 'PDF successfully parsed!',
      title,
      textLength: rawText.length,
      parsedData: rawText
    });

  } catch (error) {
    console.error('Error in parsePDFOnly:', error);
    res.status(500).json({ message: 'Server error during PDF parsing.', error: error.message });
  }
};