import mongoose from "mongoose";

const jugadorExternoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    },
    telefono: {
      type: String,
      required: true,
      trim: true,
      match: /^\+?[0-9]{13}$/,
    },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: true,
    },
    complex: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complex",
      required: true,
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    totalAmount: { type: Number, min: 0, max: 9999999, default: 0 },
    depositAmount: { type: Number, min: 0, max: 9999999, default: 0 },
    paymentId: { type: String },
    preferenceId: { type: String },
    confirmationMethod: {
      type: String,
      enum: ["mercadopago", "whatsapp", "manual"],
      default: "manual",
    },
    jugadorExterno: { type: jugadorExternoSchema, default: null },
    observaciones: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
