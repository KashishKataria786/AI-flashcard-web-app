import mongoose from 'mongoose';

const reviewStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
    required: true
  },
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  // SM-2 Algorithm specifics
  interval: {
    type: Number,
    default: 0 // Interval in days
  },
  easeFactor: {
    type: Number,
    default: 2.5 // Base ease factor for SM-2
  },
  repetitions: {
    type: Number,
    default: 0 // Number of times successfully recalled in a row
  },
  nextReviewDate: {
    type: Date,
    default: Date.now // When should the user see this next
  },
  status: {
    type: String,
    enum: ['New', 'Learning', 'Reviewing', 'Mastered'],
    default: 'New'
  }
}, {
  timestamps: true
});

// Compound index optimized for fetching due cards for a user's deck
reviewStateSchema.index({ userId: 1, deckId: 1, nextReviewDate: 1 });

const ReviewState = mongoose.model('ReviewState', reviewStateSchema);
export default ReviewState;
