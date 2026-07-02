import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s'\-&.]+$/,
    },
    descripcion: { type: String, trim: true, maxlength: 500 },
    fechaInicio: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    fechaFin: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    ubicacion: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,'-]+$/,
    },
    cupoMaximo: { type: Number, required: true, min: 1, max: 9999 },
    categoria: {
      type: String,
      enum: ["amateur", "intermedio", "avanzado", "profesional", "mixto"],
      required: true,
    },
    estado: {
      type: String,
      enum: ["activo", "finalizado", "cancelado"],
      default: "activo",
    },
    whatsapp: { type: String, trim: true, match: /^\+?[0-9]{13}$/ },
    complejo: { type: mongoose.Schema.Types.ObjectId, ref: "Complex" },
  },
  { timestamps: true },
);

export default mongoose.model("Torneo", tournamentSchema);
