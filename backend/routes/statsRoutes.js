import express from 'express';
import { getGlobalStats, getDeckStats } from '../controllers/statsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/stats/global
router.get('/global', authMiddleware, getGlobalStats);

// GET /api/stats/deck/:deckId
router.get('/deck/:deckId', authMiddleware, getDeckStats);

export default router;
