import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["approved", "rejected", "suspended"],
      required: true,
    },
    complexId: { type: mongoose.Schema.Types.ObjectId, ref: "Complex" },
    complexName: { type: String },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminName: { type: String, required: true },
    reason: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("ActivityLog", activityLogSchema);
