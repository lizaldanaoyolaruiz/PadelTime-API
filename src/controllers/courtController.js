import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import Court from '../models/Court.js';
import Complex from '../models/Complex.js';

const uploadImage = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });

const getComplexIfOwner = async (complexId, userId, role) => {
  const complex = await Complex.findById(complexId);
  if (!complex) return null;
  if (complex.owner.toString() !== userId.toString() && role !== 'SUPER_ADMIN') return null;
  return complex;
};

// POST /api/courts
export const createCourt = async (req, res) => {
  try {
    const { complexId, name, type, description, features, pricePerHour, schedule } = req.body;

    if (!complexId || !name || !type || !pricePerHour) {
      return res.status(400).json({ message: 'complexId, name, type and pricePerHour are required.' });
    }

    const complex = await getComplexIfOwner(complexId, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized to add courts to this complex.' });

    let photo;
    if (req.file) {
      const result = await uploadImage(req.file.buffer, `padeltime/complexes/${complexId}/courts`);
      photo = result.secure_url;
    }

    const court = await Court.create({
      complex: complexId,
      name, type, description,
      features: features || [],
      pricePerHour, photo, schedule,
    });

    res.status(201).json({ court });
  } catch (error) {
    res.status(500).json({ message: 'Error creating court.', error: error.message });
  }
};

// GET /api/courts?complexId=...  (owner panel — includes disabled)
export const getCourtsByComplex = async (req, res) => {
  try {
    const { complexId } = req.query;
    if (!complexId) return res.status(400).json({ message: 'complexId is required.' });

    const complex = await getComplexIfOwner(complexId, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized to view these courts.' });

    const courts = await Court.find({ complex: complexId }).sort({ createdAt: 1 });
    res.json({ courts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courts.', error: error.message });
  }
};

// PUT /api/courts/:id
export const updateCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found.' });

    const complex = await getComplexIfOwner(court.complex, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized to edit this court.' });

    const fields = ['name', 'type', 'description', 'features', 'pricePerHour', 'enabled', 'schedule'];
    fields.forEach((f) => { if (req.body[f] !== undefined) court[f] = req.body[f]; });

    if (req.file) {
      const result = await uploadImage(req.file.buffer, `padeltime/complexes/${court.complex}/courts`);
      court.photo = result.secure_url;
    }

    await court.save();
    res.json({ court });
  } catch (error) {
    res.status(500).json({ message: 'Error updating court.', error: error.message });
  }
};

// DELETE /api/courts/:id
export const deleteCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found.' });

    const complex = await getComplexIfOwner(court.complex, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized to delete this court.' });

    await court.deleteOne();
    res.json({ message: 'Court deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting court.', error: error.message });
  }
};

// GET /api/courts/public?complexId=...  (no auth — public portal)
export const getPublicCourts = async (req, res) => {
  try {
    const { complexId } = req.query;
    if (!complexId) return res.status(400).json({ message: 'complexId is required.' });

    const courts = await Court.find({ complex: complexId, enabled: true }).sort({ createdAt: 1 });
    res.json({ courts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courts.', error: error.message });
  }
};
