import mongoose from "mongoose";

const blockoutSchema = new mongoose.Schema(
  {
    complexId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "complejo",
      required: true,
    },
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "court",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-/]+$/,
    },
    recurrence: {
      type: String,
      enum: ["daily", "weekly", "once"],
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: [
        null,
        "lunes",
        "martes",
        "miercoles",
        "jueves",
        "viernes",
        "sabado",
        "domingo",
      ],
      default: null,
    },
    date: {
      type: String,
      match: /^\d{4}-\d{2}-\d{2}$/,
      default: null,
    },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Blockout", blockoutSchema);
