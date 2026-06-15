const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    complex: { type: mongoose.Schema.Types.ObjectId, ref: 'Complex', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Una valoración por usuario por complejo
reviewSchema.index({ complex: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
