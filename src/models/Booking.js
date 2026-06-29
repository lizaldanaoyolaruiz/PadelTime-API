import mongoose from 'mongoose';

const jugadorExternoSchema = new mongoose.Schema(
  {
    nombre: { type: String },
    apellido: { type: String },
    email: { type: String },
    telefono: { type: String },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    complex: { type: mongoose.Schema.Types.ObjectId, ref: 'Complex', required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    totalAmount: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    paymentId: { type: String },
    preferenceId: { type: String },
    confirmationMethod: {
      type: String,
      enum: ['mercadopago', 'whatsapp', 'manual'],
      default: 'manual',
    },
    jugadorExterno: { type: jugadorExternoSchema, default: null },
    observaciones: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
