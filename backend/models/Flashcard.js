import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  type: {
    type: String,
    enum: ['QA', 'Memorize'],
    default: 'QA',
    required: true
  },
  front: {
    type: String,
    required: true
  },
  back: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    // Optional deep dive context
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Index for fetching all cards of a single deck quickly
flashcardSchema.index({ deckId: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;
