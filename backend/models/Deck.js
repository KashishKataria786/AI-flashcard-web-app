import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  colorTheme: {
    type: String,
    default: '#ffb800' // Default to Cuemath Yellow
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  sourceText: {
    type: String,
    // Store the raw text for regeneration
  },
  generationOptions: {
    targetCount: Number,
    // Store original settings
  }
}, {
  timestamps: true
});

// Index for fast querying by owner
deckSchema.index({ ownerId: 1 });

const Deck = mongoose.model('Deck', deckSchema);
export default Deck;
