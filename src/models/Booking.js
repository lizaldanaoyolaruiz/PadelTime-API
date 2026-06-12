import mongoose from 'mongoose';

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    court: { type: Schema.Types.ObjectId, ref: 'Court', required: true },
    complex: { type: Schema.Types.ObjectId, ref: 'Complex', required: true },
    player: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
