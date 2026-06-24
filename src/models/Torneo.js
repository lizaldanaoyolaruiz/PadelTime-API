import mongoose from 'mongoose';

const torneoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    descripcion: { type: String, trim: true, maxlength: 500 },
    fechaInicio: { type: String, required: true },
    fechaFin:    { type: String, required: true },
    ubicacion: { type: String, required: true, trim: true, maxlength: 100 },
    cupoMaximo: { type: Number, required: true, min: 1, max: 9999 },
    categoria: {
      type: String,
      enum: ['amateur', 'intermedio', 'avanzado', 'profesional', 'mixto'],
      required: true,
    },
    estado: {
      type: String,
      enum: ['activo', 'finalizado', 'cancelado'],
      default: 'activo',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Torneo', torneoSchema);
