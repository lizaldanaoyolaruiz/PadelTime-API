import mongoose from 'mongoose';

const { Schema } = mongoose;

const diaSchema = new Schema(
  {
    habilitado: { type: Boolean, default: true },
    inicio: { type: String, default: '08:00' },
    fin: { type: String, default: '22:00' },
  },
  { _id: false }
);

const canchaSchema = new Schema(
  {
    complejo: { type: Schema.Types.ObjectId, ref: 'Complejo', required: true },
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    tipo: { type: String, enum: ['cristal', 'panoramica'], required: true },
    descripcion: { type: String, trim: true },
    caracteristicas: { type: [String], default: [] },
    precio_por_hora: { type: Number, required: [true, 'El precio es obligatorio'], min: 0 },
    foto: { type: String },
    habilitada: { type: Boolean, default: true },
    agenda: {
      lunes:    { type: diaSchema, default: () => ({}) },
      martes:   { type: diaSchema, default: () => ({}) },
      miercoles:{ type: diaSchema, default: () => ({}) },
      jueves:   { type: diaSchema, default: () => ({}) },
      viernes:  { type: diaSchema, default: () => ({}) },
      sabado:   { type: diaSchema, default: () => ({}) },
      domingo:  { type: diaSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Cancha', canchaSchema);
