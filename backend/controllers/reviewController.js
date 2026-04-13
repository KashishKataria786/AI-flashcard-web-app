import mongoose from 'mongoose';
import ReviewState from '../models/ReviewState.js';
import Flashcard from '../models/Flashcard.js';
import ReviewLog from '../models/ReviewLog.js';
import { calculateSM2 } from '../services/srsService.js';

/**
 * GET /api/reviews/:deckId
 * Fetches cards in a deck that are due for review (or new ones).
 */
export const getDueCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user._id;

    // Find all cards in the deck
    const allCards = await Flashcard.find({ deckId });

    // Find review states for these cards for this user
    const reviewStates = await ReviewState.find({ userId, deckId });
    
    // Create a map for quick lookup
    const reviewMap = {};
    reviewStates.forEach(rs => {
      reviewMap[rs.cardId.toString()] = rs;
    });

    const now = new Date();

    // To allow endless screening and practice, we no longer strictly filter out non-due cards.
    // Instead, we just sort them so the most "due" (or completely new) cards appear first.
    const sortedCards = allCards.sort((a, b) => {
      const stateA = reviewMap[a._id.toString()];
      const stateB = reviewMap[b._id.toString()];
      
      // 0 ensures new unreviewed cards rise to the very top.
      const timeA = stateA ? stateA.nextReviewDate.getTime() : 0;
      const timeB = stateB ? stateB.nextReviewDate.getTime() : 0;

      return timeA - timeB;
    });

    // Provide up to 50 cards per session to protect performance but give a solid screening buffer
    const sessionCards = sortedCards.slice(0, 50);

    return res.status(200).json({
      deckId,
      totalDueInDeck: allCards.length,
      cards: sessionCards.map(card => ({
        ...card._doc,
        // Include review state if it exists, otherwise provide a 'New' placeholder
        reviewState: reviewMap[card._id.toString()] || { status: 'New' }
      }))
    });

  } catch (error) {
    console.error('Error fetching due cards:', error);
    res.status(500).json({ message: 'Server error while fetching due cards.' });
  }
};

/**
 * POST /api/reviews/:cardId
 * Submits a rating for a specific card.
 * req.body: { rating, deckId }
 */
export const submitReview = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { rating, deckId } = req.body;
    const userId = req.user._id;

    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating required (0-5).' });
    }

    // Find or create ReviewState
    let state = await ReviewState.findOne({ userId, cardId });

    if (!state) {
      // First time reviewing this card
      state = new ReviewState({
        userId,
        cardId,
        deckId,
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0
      });
    }

    const statusBefore = state.status || 'New';
    const intervalBefore = state.interval || 0;

    // Apply SM-2 Logic
    const nextState = calculateSM2(
      { 
        interval: state.interval, 
        easeFactor: state.easeFactor, 
        repetitions: state.repetitions 
      }, 
      rating
    );

    // Update state fields
    state.interval = nextState.interval;
    state.easeFactor = nextState.easeFactor;
    state.repetitions = nextState.repetitions;
    state.nextReviewDate = nextState.nextReviewDate;
    state.status = nextState.status;

    await state.save();

    // Log the review for analytics
    await ReviewLog.create({
      userId,
      deckId,
      cardId,
      rating,
      statusBefore,
      statusAfter: state.status,
      intervalBefore,
      intervalAfter: state.interval
    });

    return res.status(200).json({
      message: 'Review saved!',
      nextReviewDate: state.nextReviewDate,
      interval: state.interval,
      status: state.status
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error while saving review.' });
  }
};
