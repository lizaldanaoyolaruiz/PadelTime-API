const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    complex: { type: mongoose.Schema.Types.ObjectId, ref: 'Complex', required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
    confirmationMethod: {
      type: String,
      enum: ['whatsapp', 'mercadopago'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
