import { Readable } from 'stream';
import mongoose from 'mongoose';
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

const isOwner = (complex, userId) =>
  complex.owner.toString() === userId.toString();

export const getFeaturedComplexes = async (req, res) => {
  try {
    const filter = { status: 'approved' };
    if (req.query.isFeatured === 'true') filter.isFeatured = true;

    const complexes = await Complex.find(filter)
      .select('name location price ratingAverage image openTime closeTime')
      .sort({ ratingAverage: -1 })
      .limit(6);

    const data = complexes.map((c) => ({
      id: c._id,
      name: c.name,
      location: c.location,
      price: c.price,
      rating: c.ratingAverage,
      image: c.image,
      time: c.openTime && c.closeTime ? `${c.openTime} - ${c.closeTime}` : null,
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complexes.', error: error.message });
  }
};

export const getPublicComplexes = async (req, res) => {
  try {
    const complexes = await Complex.find({ status: 'approved' })
      .select('name location city price ratingAverage ratingCount photos image description openTime closeTime');

    res.json({ complexes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complexes.', error: error.message });
  }
};

export const getPublicComplexById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Complex not found.' });
    }

    const complex = await Complex.findOne({ _id: id, status: 'approved' });
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    res.json({ complex });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complex.', error: error.message });
  }
};

export const createComplex = async (req, res) => {
  try {
    const exists = await Complex.findOne({ owner: req.user._id });
    if (exists) return res.status(400).json({ message: 'You already have a registered complex.' });

    const { name, location, city, description, whatsapp, instagram, depositPercentage, price, openTime, closeTime } = req.body;

    const complex = await Complex.create({
      owner: req.user._id,
      name, location, city, description, whatsapp, instagram,
      depositPercentage, price, openTime, closeTime,
      status: 'pending',
    });

    res.status(201).json({ complex });
  } catch (error) {
    res.status(500).json({ message: 'Error creating complex.', error: error.message });
  }
};

export const getMyComplexes = async (req, res) => {
  try {
    const complexes = await Complex.find({ owner: req.user._id }).select('_id name city status').lean();
    res.json({ complexes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complexes.', error: error.message });
  }
};

export const getMyComplex = async (req, res) => {
  try {
    const filtro = req.query.complexId
      ? { _id: req.query.complexId, owner: req.user._id }
      : { owner: req.user._id };

    const complex = await Complex.findOne(filtro).select('+mercadopagoPublicKey');
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

export const updateComplex = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwner(complex, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to edit this complex.' });
    }

    const fields = [
      'name', 'location', 'city', 'description', 'whatsapp', 'instagram',
      'depositPercentage', 'mercadopagoPublicKey', 'mercadopagoActive',
      'price', 'openTime', 'closeTime', 'image',
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

export const uploadPhotos = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwner(complex, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No images provided.' });
    }

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

export const deletePhoto = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwner(complex, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized.' });
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
      Complex.find(filter).populate('owner', 'name email').sort({ createdAt: -1 }),
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

export const approveComplex = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id).populate('owner', 'name email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'approved';
    complex.rejectReason = undefined;
    await complex.save();

    await ActivityLog.create({
      action: 'approved',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: req.user.name,
    });

    sendApprovalEmail(complex.owner).catch((err) =>
      console.error('[email] Approval error:', err.message)
    );

    res.json({ message: 'Complex approved.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const rejectComplex = async (req, res) => {
  try {
    const { reason } = req.body;
    const complex = await Complex.findById(req.params.id).populate('owner', 'name email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'rejected';
    complex.rejectReason = reason;
    await complex.save();

    await ActivityLog.create({
      action: 'rejected',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: req.user.name,
      reason,
    });

    sendRejectionEmail(complex.owner, reason).catch((err) =>
      console.error('[email] Rejection error:', err.message)
    );

    res.json({ message: 'Complex rejected.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const suspendComplex = async (req, res) => {
  try {
    const { reason } = req.body;
    const complex = await Complex.findById(req.params.id).populate('owner', 'name email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'suspended';
    complex.rejectReason = reason;
    await complex.save();

    await ActivityLog.create({
      action: 'suspended',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: req.user.name,
      reason,
    });

    res.json({ message: 'Complex suspended.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.isFeatured = !complex.isFeatured;
    await complex.save();

    res.json({ isFeatured: complex.isFeatured });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteComplex = async (req, res) => {
  try {
    const complex = await Complex.findByIdAndDelete(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });
    res.json({ message: 'Complex deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};
