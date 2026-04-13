import mongoose from 'mongoose';

const reviewLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  statusBefore: {
    type: String,
    enum: ['New', 'Learning', 'Reviewing', 'Mastered'],
    required: true
  },
  statusAfter: {
    type: String,
    enum: ['New', 'Learning', 'Reviewing', 'Mastered'],
    required: true
  },
  intervalBefore: {
    type: Number,
    required: true
  },
  intervalAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true // This gives us 'createdAt' which is our review timestamp
});

// Index for fast analytics queries
reviewLogSchema.index({ userId: 1, createdAt: 1 });
reviewLogSchema.index({ deckId: 1, createdAt: 1 });

const ReviewLog = mongoose.model('ReviewLog', reviewLogSchema);
export default ReviewLog;
