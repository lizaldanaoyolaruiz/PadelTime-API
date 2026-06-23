import User from '../models/User.js';
import Complex from '../models/Complex.js';
import Booking from '../models/Booking.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

// ── LIST ──────────────────────────────────────────────────────────────────────

export const getAdminUsers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'admin' };
    if (status) filter.status = status;

    const users = await User.find(filter).sort({ createdAt: -1 });

    // attach complexes count for each owner
    const usersWithCount = await Promise.all(
      users.map(async (u) => {
        const complexesCount = await Complex.countDocuments({ owner: u._id });
        return { ...u.toObject(), complexesCount };
      })
    );

    res.json({ users: usersWithCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
};

// ── CREATE ────────────────────────────────────────────────────────────────────

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      location: location || '',
      role: 'admin',
      status: 'approved',
      isVerified: true,
    });

    const { password: _pw, ...safe } = user.toObject();
    res.status(201).json({ user: safe });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el propietario.', error: error.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────

export const updateAdminUser = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    const user = await User.findOne({ _id: req.params.id, role: 'admin' }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Propietario no encontrado.' });
    }

    if (name)     user.name     = name;
    if (email)    user.email    = email.toLowerCase();
    if (location !== undefined) user.location = location;
    if (password) user.password = password; // pre-save hook hashea

    await user.save();

    const { password: _pw, ...safe } = user.toObject();
    res.json({ user: safe });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el propietario.', error: error.message });
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────

export const deleteAdminUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!user) {
      return res.status(404).json({ message: 'Propietario no encontrado.' });
    }

    await user.deleteOne();
    res.json({ message: 'Propietario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el propietario.', error: error.message });
  }
};

// ── TOGGLE STATUS ─────────────────────────────────────────────────────────────

export const toggleAdminStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido. Usar "approved" o "suspended".' });
    }

    const user = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!user) {
      return res.status(404).json({ message: 'Propietario no encontrado.' });
    }

    user.status = status;
    await user.save();

    res.json({ message: 'Estado actualizado.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado.', error: error.message });
  }
};

// ── STATS ─────────────────────────────────────────────────────────────────────

export const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalComplexes, activeUsers, monthlyReservations] = await Promise.all([
      Complex.countDocuments({ status: 'approved' }),
      User.countDocuments({ role: 'admin', status: 'approved' }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    res.json({
      totalComplexes,
      activeUsers,
      monthlyReservations,
      annualRevenue: 0, // placeholder hasta integrar revenue real
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo estadísticas.', error: error.message });
  }
};

// ── APPROVE / REJECT (existentes) ─────────────────────────────────────────────

export const approveAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found.' });
    }

    user.status = 'approved';
    await user.save();

    sendApprovalEmail(user).catch((err) =>
      console.error('[email] Approval error:', err.message)
    );

    res.json({ message: 'Admin approved successfully.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error approving admin.', error: error.message });
  }
};

export const rejectAdmin = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found.' });
    }

    user.status = 'rejected';
    await user.save();

    sendRejectionEmail(user, reason).catch((err) =>
      console.error('[email] Rejection error:', err.message)
    );

    res.json({ message: 'Admin rejected.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting admin.', error: error.message });
  }
};
