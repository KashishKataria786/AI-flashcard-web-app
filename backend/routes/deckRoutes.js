import express from 'express';
import { getAllDecks, getDeckById, regenerateDeck, deleteDeck } from '../controllers/deckController.js';

const router = express.Router();

router.get('/', getAllDecks);
router.get('/:id', getDeckById);
router.post('/:id/regenerate', regenerateDeck);
router.delete('/:id', deleteDeck);

export default router;