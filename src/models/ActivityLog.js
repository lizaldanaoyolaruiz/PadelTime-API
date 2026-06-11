import mongoose from 'mongoose';

const { Schema } = mongoose;

const activityLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['approved', 'rejected', 'suspended'],
    },
    complexId: { type: Schema.Types.ObjectId, ref: 'Complejo' },
    complexName: { type: String },
    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
    adminName: { type: String },
    reason: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', activityLogSchema);
