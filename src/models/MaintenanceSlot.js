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
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    motivo: { type: String, default: "Mantenimiento" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("MaintenanceSlot", maintenanceSlotSchema);
