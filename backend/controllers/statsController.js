import ReviewLog from '../models/ReviewLog.js';
import ReviewState from '../models/ReviewState.js';
import Deck from '../models/Deck.js';
import mongoose from 'mongoose';

/**
 * GET /api/stats/global
 * Aggregates mastery stats and review history across all decks.
 */
export const getGlobalStats = async (req, res) => {
  try {
    const userId = req.user?._id || '65f0b1a20c3d5e0f1a2b3c4d';

    // 1. Mastery Breakdown (Current State)
    const breakdown = await ReviewState.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 2. Learning Curve (Reviews over last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const history = await ReviewLog.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: fourteenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          reviews: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 3. Totals
    const totalDecks = await Deck.countDocuments({ ownerId: userId });
    const totalMastered = breakdown.find(b => b._id === 'Mastered')?.count || 0;

    res.status(200).json({
      summary: {
        totalDecks,
        totalMastered,
        totalReviews: history.reduce((acc, curr) => acc + curr.reviews, 0)
      },
      breakdown,
      history
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ message: 'Server error while fetching stats.' });
  }
};

/**
 * GET /api/stats/deck/:deckId
 * Specific analytics for a single deck.
 */
export const getDeckStats = async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user?._id || '65f0b1a20c3d5e0f1a2b3c4d';

    const breakdown = await ReviewState.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          deckId: new mongoose.Types.ObjectId(deckId)
        } 
      },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const history = await ReviewLog.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          deckId: new mongoose.Types.ObjectId(deckId)
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          reviews: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({ breakdown, history });
  } catch (error) {
    console.error('Error fetching deck stats:', error);
    res.status(500).json({ message: 'Server error while fetching deck stats.' });
  }
};
