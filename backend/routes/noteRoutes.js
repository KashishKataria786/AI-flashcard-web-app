import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
  getAllNotes, 
  getNoteById, 
  processPDFNotesUpload,
  processTextNotesUpload, 
  deleteNote 
} from '../controllers/notesController.js';

const router = express.Router();

// Multer memory storage for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  }
});

// GET /api/notes - Fetch all notes
router.get('/', authMiddleware, getAllNotes);

// GET /api/notes/:id - Fetch single note
router.get('/:id', authMiddleware, getNoteById);

// POST /api/notes/pdf - Generate notes from PDF
router.post('/pdf', authMiddleware, upload.single('pdf'), processPDFNotesUpload);

// POST /api/notes/text - Generate notes from text (used for both direct paste and PDF review)
router.post('/text', authMiddleware, processTextNotesUpload);

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', authMiddleware, deleteNote);

export default router;
