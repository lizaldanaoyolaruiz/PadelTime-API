import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import Complex from '../models/Complex.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

const uploadImage = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });

const isOwnerOrAdmin = (complex, userId, role) =>
  complex.owner.toString() === userId.toString() || role === 'SUPER_ADMIN';

// ─── OWNER ───────────────────────────────────────────────────────────────────

// POST /api/complexes
export const createComplex = async (req, res) => {
  try {
    const exists = await Complex.findOne({ owner: req.user._id });
    if (exists) return res.status(400).json({ message: 'You already have a registered complex.' });

    const { name, location, city, whatsapp, instagram, depositPercentage, price, openTime, closeTime, courts } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Name and location are required.' });
    }

    const complex = await Complex.create({
      owner: req.user._id,
      name, location, city, whatsapp, instagram,
      depositPercentage, price, openTime, closeTime, courts,
      status: 'pending',
    });

    res.status(201).json({ complex });
  } catch (error) {
    res.status(500).json({ message: 'Error creating complex.', error: error.message });
  }
};

// GET /api/complexes/me
export const getMyComplex = async (req, res) => {
  try {
    const complex = await Complex.findOne({ owner: req.user._id }).select('+mercadopagoPublicKey');
    if (!complex) return res.status(404).json({ message: 'No complex registered.' });

    const data = complex.toObject();
    if (data.mercadopagoPublicKey) {
      data.mercadopagoPublicKey = '••••••••' + data.mercadopagoPublicKey.slice(-4);
    }

    res.json({ complex: data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complex.', error: error.message });
  }
};

// PUT /api/complexes/:id
export const updateComplex = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwnerOrAdmin(complex, req.user._id, req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to edit this complex.' });
    }

    const fields = [
      'name', 'location', 'city', 'whatsapp', 'instagram',
      'depositPercentage', 'mercadopagoPublicKey', 'mercadopagoActive',
      'price', 'openTime', 'closeTime', 'courts', 'image',
    ];

    fields.forEach((f) => { if (req.body[f] !== undefined) complex[f] = req.body[f]; });

    await complex.save();

    const data = complex.toObject();
    delete data.mercadopagoPublicKey;
    res.json({ complex: data });
  } catch (error) {
    res.status(500).json({ message: 'Error updating complex.', error: error.message });
  }
};

// POST /api/complexes/:id/photos
export const uploadPhotos = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwnerOrAdmin(complex, req.user._id, req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to upload photos.' });
    }

    if (!req.files?.length) return res.status(400).json({ message: 'No images provided.' });

    const results = await Promise.all(
      req.files.map((f) => uploadImage(f.buffer, `padeltime/complexes/${complex._id}`))
    );

    complex.photos.push(...results.map((r) => r.secure_url));
    if (!complex.image) complex.image = results[0].secure_url;
    await complex.save();

    res.json({ photos: complex.photos });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photos.', error: error.message });
  }
};

// DELETE /api/complexes/:id/photos  — body: { url }
export const deletePhoto = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwnerOrAdmin(complex, req.user._id, req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to delete photos.' });
    }

    const { url } = req.body;
    complex.photos = complex.photos.filter((p) => p !== url);
    if (complex.image === url) complex.image = complex.photos[0] || null;
    await complex.save();

    const segments = url.split('/');
    const publicId = `padeltime/complexes/${complex._id}/${segments[segments.length - 1].split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);

    res.json({ photos: complex.photos });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting photo.', error: error.message });
  }
};

// ─── SUPER ADMIN ─────────────────────────────────────────────────────────────

// GET /api/complexes/admin
export const getAdminComplexes = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [complexes, total, pending, approved, rejected, suspended] = await Promise.all([
      Complex.find(filter).populate('owner', 'nombre apellido email').sort({ createdAt: -1 }),
      Complex.countDocuments(),
      Complex.countDocuments({ status: 'pending' }),
      Complex.countDocuments({ status: 'approved' }),
      Complex.countDocuments({ status: 'rejected' }),
      Complex.countDocuments({ status: 'suspended' }),
    ]);

    res.json({ data: complexes, stats: { total, pending, approved, rejected, suspended } });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PATCH /api/complexes/:id/approve
export const approveComplex = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id).populate('owner', 'nombre apellido email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'approved';
    complex.rejectReason = undefined;
    await complex.save();

    await ActivityLog.create({
      action: 'approved',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: `${req.user.nombre} ${req.user.apellido || ''}`.trim(),
    });

    sendApprovalEmail(complex).catch((err) =>
      console.error('[emailService] Approval email error:', err.message)
    );

    res.json({ message: 'Complex approved successfully.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PATCH /api/complexes/:id/reject
export const rejectComplex = async (req, res) => {
  try {
    const { reason } = req.body;
    const complex = await Complex.findById(req.params.id).populate('owner', 'nombre apellido email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'rejected';
    complex.rejectReason = reason;
    await complex.save();

    await ActivityLog.create({
      action: 'rejected',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: `${req.user.nombre} ${req.user.apellido || ''}`.trim(),
      reason,
    });

    sendRejectionEmail(complex, reason).catch((err) =>
      console.error('[emailService] Rejection email error:', err.message)
    );

    res.json({ message: 'Complex rejected.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PATCH /api/complexes/:id/suspend
export const suspendComplex = async (req, res) => {
  try {
    const { reason } = req.body;
    const complex = await Complex.findById(req.params.id).populate('owner', 'nombre apellido email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'suspended';
    complex.rejectReason = reason;
    await complex.save();

    await ActivityLog.create({
      action: 'suspended',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: `${req.user.nombre} ${req.user.apellido || ''}`.trim(),
      reason,
    });

    res.json({ message: 'Complex suspended.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/complexes/activity
export const getActivityLog = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};
