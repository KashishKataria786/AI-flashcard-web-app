import express from 'express';
import { getGlobalStats, getDeckStats } from '../controllers/statsController.js';

const router = express.Router();

// GET /api/stats/global
router.get('/global', getGlobalStats);

// GET /api/stats/deck/:deckId
router.get('/deck/:deckId', getDeckStats);

export default router;
