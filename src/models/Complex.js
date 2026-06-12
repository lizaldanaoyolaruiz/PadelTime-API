import mongoose from 'mongoose';

const { Schema } = mongoose;

const complexSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    city: { type: String, trim: true },
    image: { type: String },
    photos: { type: [String], default: [] },
    price: { type: Number },
    openTime: { type: String },
    closeTime: { type: String },
    courts: { type: Number, default: 1 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    whatsapp: { type: String, trim: true },
    instagram: { type: String, trim: true },
    mercadopagoPublicKey: { type: String, select: false },
    mercadopagoActive: { type: Boolean, default: false },
    depositPercentage: { type: Number, enum: [20, 30, 50], default: 30 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Complex', complexSchema);
