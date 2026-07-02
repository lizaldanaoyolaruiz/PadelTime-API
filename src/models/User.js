import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [101, "El nombre no puede tener más de 101 caracteres"],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'-]+(?: [a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'-]+)*$/,
        "El nombre solo puede contener letras",
      ],
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [6, "El email debe tener al menos 6 caracteres"],
      maxlength: [100, "El email no puede tener más de 100 caracteres"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Email inválido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
      maxlength: [64, "La contraseña no puede tener más de 64 caracteres"],
      select: false,
    },
    role: {
      type: String,
      enum: ["player", "admin", "superadmin"],
      default: "player",
    },
    complexId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "complex",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "La ubicación no puede tener más de 100 caracteres"],
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Complex" }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
