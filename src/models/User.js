import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    apellido: {
      type: String,
      trim: true,
      default: '',
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'owner', 'player', 'admin', 'SUPER_ADMIN'],
      default: 'user',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.compararPassword = function (candidato) {
  return bcrypt.compare(candidato, this.password);
};

export default mongoose.model('User', userSchema);
