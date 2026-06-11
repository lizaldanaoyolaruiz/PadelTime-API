import mongoose from 'mongoose';

const { Schema } = mongoose;

const complejoSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    city: { type: String, trim: true },
    image: { type: String },
    fotos: { type: [String], default: [] },
    price: { type: Number },
    openTime: { type: String },
    closeTime: { type: String },
    courts: { type: Number, default: 1 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectReason: { type: String },
    // Campos del panel de owner
    whatsapp: { type: String, trim: true },
    instagram: { type: String, trim: true },
    mercadopago_public_key: { type: String, select: false },
    mercadopago_activo: { type: Boolean, default: false },
    porcentaje_sena: { type: Number, enum: [20, 30, 50], default: 30 },
  },
  { timestamps: true }
);

export default mongoose.model('Complejo', complejoSchema);
