import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
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
