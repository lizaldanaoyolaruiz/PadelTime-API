import mongoose from "mongoose";

const complexSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s'\-&.]+$/,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,'-]+$/,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      enum: ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo"],
    },
    province: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'\-.]+$/,
      default: "Tucumán",
    },
    phone: { type: String, trim: true, match: /^\+?[0-9]{13}$/ },
    courts: { type: Number, min: 1, max: 50 },
    description: { type: String, trim: true, minlength: 3, maxlength: 500 },
    image: { type: String },
    photos: { type: [String], default: [] },
    price: { type: Number, min: 0.01, max: 999999 },
    openTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    closeTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    whatsapp: { type: String, trim: true, match: /^\+?[0-9]{13}$/ },
    instagram: { type: String, trim: true },
    mercadopagoPublicKey: { type: String, select: false },

    mpAccessToken: { type: String, select: false },
    mercadopagoActive: { type: Boolean, default: false },
    depositPercentage: { type: Number, min: 0, max: 100, default: 30 },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    rejectReason: { type: String, maxlength: 300 },
    observations: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true },
);

export default mongoose.model("Complex", complexSchema);
