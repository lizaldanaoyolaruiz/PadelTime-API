import mongoose from 'mongoose';

const daySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    start: { type: String, default: '08:00' },
    end: { type: String, default: '22:00' },
  },
  { _id: false }
);

const courtSchema = new mongoose.Schema(
  {
    complex: { type: mongoose.Schema.Types.ObjectId, ref: 'Complex', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['crystal', 'panoramic'], required: true },
    description: { type: String, trim: true },
    features: { type: [String], default: [] },
    pricePerHour: { type: Number, required: true, min: 0 },
    photo: { type: String },
    photos: { type: [String], default: [] },
    enabled: { type: Boolean, default: true },
    schedule: {
      monday:    { type: daySchema, default: () => ({}) },
      tuesday:   { type: daySchema, default: () => ({}) },
      wednesday: { type: daySchema, default: () => ({}) },
      thursday:  { type: daySchema, default: () => ({}) },
      friday:    { type: daySchema, default: () => ({}) },
      saturday:  { type: daySchema, default: () => ({}) },
      sunday:    { type: daySchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Court', courtSchema);
