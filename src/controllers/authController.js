const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  sendVerificationEmail,
  sendPendingApprovalEmail,
} = require('../services/emailService');

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  isVerified: user.isVerified,
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const allowedRoles = ['player', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'player';

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

    // admin: starts as pending, no email verification needed
    userData.isVerified = true;
    userData.status = 'pending';

    const user = await User.create(userData);
    sendPendingApprovalEmail(user).catch((err) =>
      console.error('[email] Pending approval error:', err.message)
    );

    res.status(201).json({
      message: 'Admin account created. Awaiting superadmin approval.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.', error: error.message });
  }
};

// GET /api/auth/verify-email?token=...
const verifyEmail = async (req, res) => {
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

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.role === 'player' && !user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    if (user.role === 'admin' && user.status !== 'approved') {
      return res.status(403).json({
        message:
          user.status === 'pending'
            ? 'Your account is pending superadmin approval.'
            : 'Your account has been rejected.',
      });
    }

    const token = generateToken(user);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

module.exports = { register, verifyEmail, login, getMe };
