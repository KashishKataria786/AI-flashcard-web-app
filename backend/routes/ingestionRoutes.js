import express from 'express';
import multer from 'multer';
import { processPDFUpload, processTextUploadAgain, parsePDFOnly } from '../controllers/ingestionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Memory storage — keeps PDF in RAM as Buffer, no disk writes
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

// POST /api/ingestion/pdf
router.post('/pdf', authMiddleware, upload.single('pdf'), processPDFUpload);

// POST /api/ingestion/text
router.post('/text', authMiddleware, processTextUploadAgain);

// POST /api/ingestion/parse-pdf - Debugging/Screening Route
router.post('/parse-pdf', authMiddleware, upload.single('pdf'), parsePDFOnly);

export default router;
