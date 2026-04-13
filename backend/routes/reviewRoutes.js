import express from 'express';
import { getDueCards, submitReview } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/reviews/:deckId - Fetch cards due for review
router.get('/:deckId', authMiddleware, getDueCards);

// POST /api/reviews/:cardId - Submit a review rating (1-5)
router.post('/:cardId', authMiddleware, submitReview);

export default router;
