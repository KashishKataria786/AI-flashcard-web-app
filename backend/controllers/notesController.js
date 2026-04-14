import Note from '../models/Note.js';
import { extractTextFromPDF, chunkText } from '../services/pdfService.js';
import { generateComprehensiveNotes } from '../services/huggingFaceService.js';

/**
 * POST /api/notes/pdf
 * Generates study notes directly from an uploaded PDF.
 * Sequential processing to stay within memory limits.
 */
export const processPDFNotesUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }
    const { noteTitle } = req.body;
    const userId = req.user._id;

    // 1. Extract Text
    const rawText = await extractTextFromPDF(req.file.buffer);
    if (!rawText || rawText.trim().length < 100) {
      return res.status(400).json({ message: 'The PDF seems to have too little text to analyze.' });
    }

    // 2. Chunk and Generate Notes in parallel batches
    const chunks = chunkText(rawText, 3500, 300); 
    const notesResults = [];
    const BATCH_SIZE = 2; // Speed up with safe batching

    console.log(`[Notes] Generating guide with smart batching (Size: ${BATCH_SIZE}) for PDF: "${noteTitle || req.file.originalname}" — Chunks: ${chunks.length}`);

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(chunk => generateComprehensiveNotes(chunk))
      );
      notesResults.push(...batchResults.filter(r => r && r.trim().length > 0));
      console.log(`[Notes] Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
    }

    const fullContent = notesResults.join('\n\n---\n\n');

    if (!fullContent || fullContent.length < 50) {
      return res.status(500).json({ message: 'AI failed to generate study notes.' });
    }

    // 3. Save to Database
    const newNote = await Note.create({
      title: noteTitle?.trim() || req.file.originalname.replace(/\.pdf$/i, ''),
      content: fullContent,
      ownerId: userId,
      sourceType: 'pdf'
    });

    res.status(201).json({
      message: 'Study notes generated successfully!',
      note: newNote
    });

  } catch (error) {
    console.error('Error creating note from PDF:', error);
    res.status(500).json({ message: 'Server error during note generation.' });
  }
};

/**
 * GET /api/notes
 * Fetches all study notes for the authenticated user.
 */
export const getAllNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await Note.find({ ownerId: userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error while fetching notes.' });
  }
};

/**
 * GET /api/notes/:id
 * Fetches a single note by ID.
 */
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/notes/text
 * Generates study notes from raw text input.
 * This is the primary generation endpoint used by both direct paste and PDF-to-Verify flows.
 */
export const processTextNotesUpload = async (req, res) => {
  try {
    const { text, noteTitle } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length < 100) {
      return res.status(400).json({ message: 'Please provide more text (minimum 100 characters) for analysis.' });
    }

    const rawText = text.trim();
    console.log(`[Notes] Generating guide for "${noteTitle || 'Untitled'}" — Text Length: ${rawText.length}`);

    // 1. Smart-chunk the text for LLM processing
    const chunks = chunkText(rawText, 3500, 300);
    const notesResults = [];
    const BATCH_SIZE = 2; // Speed up with safe batching

    console.log(`[Notes] Generating guide with smart batching (Size: ${BATCH_SIZE}) for "${noteTitle || 'Untitled'}" — Chunks: ${chunks.length}`);

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(chunk => generateComprehensiveNotes(chunk))
      );
      notesResults.push(...batchResults.filter(r => r && r.trim().length > 0));
      console.log(`[Notes] Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
    }

    const fullContent = notesResults.join('\n\n---\n\n');

    if (!fullContent || fullContent.length < 50) {
      return res.status(500).json({ message: 'AI failed to generate a comprehensive study guide. Try different content.' });
    }

    // 2. Save to Database
    const newNote = await Note.create({
      title: noteTitle?.trim() || 'AI Generated Note',
      content: fullContent,
      ownerId: userId,
      sourceType: 'text'
    });

    res.status(201).json({
      message: 'Study guide generated successfully!',
      note: newNote
    });

  } catch (error) {
    console.error('Error creating note from text:', error);
    res.status(500).json({ message: 'Server error during note generation.' });
  }
};

/**
 * DELETE /api/notes/:id
 * Deletes a study note.
 */
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);

    if (!note) return res.status(404).json({ message: 'Note not found.' });

    if (note.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await Note.findByIdAndDelete(id);
    res.status(200).json({ message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error during deletion.' });
  }
};
