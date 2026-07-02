import mongoose from "mongoose";

const daySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    start: { type: String, default: "08:00" },
    end: { type: String, default: "22:00" },
  },
  { _id: false },
);

const courtSchema = new mongoose.Schema(
  {
    complex: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complex",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s'-]+$/,
    },
    type: { type: String, enum: ["crystal", "panoramic"], required: true },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 300,
    },
    features: { type: [String], default: [] },
    pricePerHour: { type: Number, min: 0, max: 999999, default: 0 },
    photo: { type: String },
    photos: { type: [String], default: [] },
    enabled: { type: Boolean, default: true },
    schedule: {
      monday: { type: daySchema, default: () => ({}) },
      tuesday: { type: daySchema, default: () => ({}) },
      wednesday: { type: daySchema, default: () => ({}) },
      thursday: { type: daySchema, default: () => ({}) },
      friday: { type: daySchema, default: () => ({}) },
      saturday: { type: daySchema, default: () => ({}) },
      sunday: { type: daySchema, default: () => ({}) },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Court", courtSchema);
