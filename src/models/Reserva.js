import mongoose from 'mongoose';

const { Schema } = mongoose;

const reservaSchema = new Schema(
  {
    cancha: { type: Schema.Types.ObjectId, ref: 'Cancha', required: true },
    complejo: { type: Schema.Types.ObjectId, ref: 'Complejo', required: true },
    jugador: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fecha: { type: Date, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    montoTotal: { type: Number, required: true, min: 0 },
    montoSena: { type: Number, default: 0, min: 0 },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'rechazada', 'cancelada', 'completada'],
      default: 'pendiente',
    },
    notaOwner: { type: String, trim: true },
    pagoId: { type: String },
  },
  { timestamps: true }
);

// Índice compuesto para evitar reservas duplicadas en el mismo turno
reservaSchema.index({ cancha: 1, fecha: 1, horaInicio: 1 }, { unique: true });

export default mongoose.model('Reserva', reservaSchema);
