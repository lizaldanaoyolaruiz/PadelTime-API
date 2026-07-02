import crypto from "crypto";
import { Readable } from "stream";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, width: 400, height: 400, crop: "fill" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    Readable.from(buffer).pipe(stream);
  });
import generateToken from "../utils/generateToken.js";
import { sendVerificationEmail } from "../services/emailService.js";

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  isVerified: user.isVerified,
  avatar: user.avatar || "",
  ...(user.complexId && { complexId: user.complexId }),
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(400)
        .json({ message: "El email ya está registrado." });

    const assignedRole = role === "admin" ? "admin" : "player";
    const userData = { name, email, password, role: assignedRole };

    if (assignedRole === "player") {
      const token = crypto.randomBytes(32).toString("hex");
      userData.verificationToken = token;
      userData.isVerified = false;
      userData.status = "approved";

      const user = await User.create(userData);
      try {
        await sendVerificationEmail(user, token);
      } catch (err) {
        console.error("[email] Error de verificación:", err.message);
      }

      return res.status(201).json({
        message:
          "Cuenta creada. Verificá tu email antes de iniciar sesión.",
      });
    }

    userData.isVerified = true;
    userData.status = "approved";

    const user = await User.create(userData);
    const token = generateToken(user);

    res
      .status(201)
      .json({
        message: "Cuenta de administrador creada.",
        token,
        user: formatUser(user),
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al registrar el usuario.", error: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "El email es requerido." });

    const user = await User.findOne({ email }).select("+verificationToken");
    if (!user)
      return res
        .status(404)
        .json({ message: "No se encontró una cuenta con ese email." });
    if (user.isVerified)
      return res
        .status(400)
        .json({ message: "Esta cuenta ya está verificada." });

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    await user.save();

    await sendVerificationEmail(user, token);

    res.json({
      message: "Email de verificación reenviado. Revisá tu bandeja de entrada.",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al reenviar el email de verificación.",
        error: error.message,
      });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ message: "El token es requerido." });

    const user = await User.findOne({ verificationToken: token }).select(
      "+verificationToken",
    );
    if (!user)
      return res.status(400).json({ message: "Token inválido o expirado." });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verificado correctamente. Ya podés iniciar sesión." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al verificar el email.", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    if (user.role === "player" && !user.isVerified) {
      return res
        .status(403)
        .json({ message: "Verificá tu email antes de iniciar sesión." });
    }

    const token = generateToken(user);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al iniciar sesión.", error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

export const updateMe = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password;

    await user.save();
    res.json({ user: formatUser(user) });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al actualizar el perfil.",
        error: error.message,
      });
  }
};

export const deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Cuenta eliminada correctamente." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar la cuenta.", error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No se recibió ninguna imagen." });

    const result = await uploadToCloudinary(
      req.file.buffer,
      "padeltime/avatars",
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true },
    );

    res.json({ user: formatUser(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al subir la imagen.", error: error.message });
  }
};
