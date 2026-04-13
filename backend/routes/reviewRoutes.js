import express from 'express';
import { getDueCards, submitReview } from '../controllers/reviewController.js';

const router = express.Router();

// GET /api/reviews/:deckId - Fetch cards due for review
router.get('/:deckId', getDueCards);

// POST /api/reviews/:cardId - Submit a review rating (1-5)
router.post('/:cardId', submitReview);

export default router;
