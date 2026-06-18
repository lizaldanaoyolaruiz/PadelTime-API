const mongoose = require('mongoose');

const complexSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    city: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    photos: { type: [String], default: [] },
    price: { type: Number },
    openTime: { type: String },
    closeTime: { type: String },
    whatsapp: { type: String, trim: true },
    instagram: { type: String, trim: true },
    mercadopagoPublicKey: { type: String, select: false },
    // Private access token of the owner's MP account — never returned by default.
    // For OAuth marketplace migration: replace the manual-token flow with an OAuth callback
    // that writes this same field; all downstream code (mpService, bookingController) stays unchanged.
    mpAccessToken: { type: String, select: false },
    mercadopagoActive: { type: Boolean, default: false },
    depositPercentage: { type: Number, enum: [20, 30, 50], default: 30 },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complex', complexSchema);
