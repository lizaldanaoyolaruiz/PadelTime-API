import crypto from 'crypto';
import { Readable } from 'stream';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, width: 400, height: 400, crop: 'fill' },
      (error, result) => { if (error) return reject(error); resolve(result); }
    );
    Readable.from(buffer).pipe(stream);
  });
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail } from '../services/emailService.js';

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  isVerified: user.isVerified,
  avatar: user.avatar || '',
  ...(user.complexId && { complexId: user.complexId }),
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const assignedRole = role === 'admin' ? 'admin' : 'player';
    const userData = { name, email, password, role: assignedRole };

    if (assignedRole === 'player') {
      const token = crypto.randomBytes(32).toString('hex');
      userData.verificationToken = token;
      userData.isVerified = false;
      userData.status = 'approved';

      const user = await User.create(userData);
      sendVerificationEmail(user, token).catch((err) =>
        console.error('[email] Verification error:', err.message)
      );

      return res.status(201).json({
        message: 'Account created. Please verify your email before logging in.',
      });
    }

    userData.isVerified = true;
    userData.status = 'approved';

    const user = await User.create(userData);
    const token = generateToken(user);

    res.status(201).json({ message: 'Admin account created.', token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is required.' });

    const user = await User.findOne({ verificationToken: token }).select('+verificationToken');
    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.role === 'player' && !user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = generateToken(user);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

export const updateMe = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    if (name)  user.name  = name;
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password; // pre-save hook hashea

    await user.save();
    res.json({ user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el perfil.', error: error.message });
  }
};

export const deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Cuenta eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la cuenta.', error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ninguna imagen.' });

    const result = await uploadToCloudinary(req.file.buffer, 'padeltime/avatars');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.json({ user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir la imagen.', error: error.message });
  }
};