import mongoose from "mongoose";

const maintenanceSlotSchema = new mongoose.Schema(
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
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    motivo: { type: String, trim: true, maxlength: 150, default: "Mantenimiento" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("MaintenanceSlot", maintenanceSlotSchema);
