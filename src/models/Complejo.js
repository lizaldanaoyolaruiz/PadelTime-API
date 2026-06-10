import mongoose from 'mongoose';

const { Schema } = mongoose;

const complejoSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    direccion: { type: String, required: [true, 'La dirección es obligatoria'], trim: true },
    whatsapp: { type: String, trim: true },
    instagram: { type: String, trim: true },
    fotos: { type: [String], default: [] },
    mercadopago_public_key: { type: String, select: false },
    mercadopago_activo: { type: Boolean, default: false },
    porcentaje_sena: { type: Number, enum: [20, 30, 50], default: 30 },
    estado: {
      type: String,
      enum: ['pendiente', 'aprobado', 'rechazado'],
      default: 'pendiente',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Complejo', complejoSchema);
