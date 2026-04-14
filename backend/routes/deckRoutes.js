import express from 'express';
import { getAllDecks, getDeckById, regenerateDeck, deleteDeck, exportDeckToPDF } from '../controllers/deckController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllDecks);
router.get('/:id', authMiddleware, getDeckById);
router.post('/:id/regenerate', authMiddleware, regenerateDeck);
router.delete('/:id', authMiddleware, deleteDeck);
router.get('/:id/export', authMiddleware, exportDeckToPDF);

export default router;