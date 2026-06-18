import User from '../models/User.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

export const getAdminUsers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'admin' };
    if (status) filter.status = status;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
};

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
