import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import Court from '../models/Court.js';
import Blockout from '../models/Blockout.js';
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
  if (complex.owner.toString() !== userId.toString() && role !== 'superadmin') return null;
  return complex;
};

export const createCourt = async (req, res) => {
  try {
    const { complexId, name, type, description, features, pricePerHour, schedule } = req.body;

    const complex = await getComplexIfOwner(complexId, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized to add courts to this complex.' });

    let photo;
    if (req.file) {
      const result = await uploadImage(req.file.buffer, `padeltime/complexes/${complexId}/courts`);
      photo = result.secure_url;
    }

    const court = await Court.create({
      complex: complexId, name, type, description,
      features: features || [], pricePerHour, photo, schedule,
    });

    res.status(201).json({ court });
  } catch (error) {
    res.status(500).json({ message: 'Lo sentimos, no pudimos crear la cancha. Intenta nuevamente.', error: error.message });
  }
};

export const getCourtsByComplex = async (req, res) => {
  try {
    const { complexId } = req.query;
    if (!complexId) return res.status(400).json({ message: 'complexId is required.' });

    const complex = await getComplexIfOwner(complexId, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized.' });

    const courts = await Court.find({ complex: complexId }).sort({ createdAt: 1 });
    res.json({ courts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courts.', error: error.message });
  }
};

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

export const getPublicCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).populate('complex', 'price name');
    if (!court || !court.enabled) return res.status(404).json({ message: 'Court not found.' });
    res.json({ court });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching court.', error: error.message });
  }
};

export const uploadCourtPhotos = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found.' });

    const complex = await getComplexIfOwner(court.complex, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized.' });

    if (!req.files?.length) return res.status(400).json({ message: 'No files provided.' });

    const uploaded = await Promise.all(
      req.files.map(f => uploadImage(f.buffer, `padeltime/complexes/${court.complex}/courts`))
    );
    const urls = uploaded.map(r => r.secure_url);

    court.photos = [...(court.photos || []), ...urls];
    if (!court.photo) court.photo = urls[0];
    await court.save();

    res.json({ photos: court.photos, photo: court.photo });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading court photos.', error: error.message });
  }
};

export const deleteCourtPhoto = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found.' });

    const complex = await getComplexIfOwner(court.complex, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized.' });

    const { url } = req.body;
    court.photos = (court.photos || []).filter(u => u !== url);
    if (court.photo === url) court.photo = court.photos[0] || null;
    await court.save();

    res.json({ photos: court.photos, photo: court.photo });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting court photo.', error: error.message });
  }
};

export const setCourtPrincipalPhoto = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found.' });

    const complex = await getComplexIfOwner(court.complex, req.user._id, req.user.role);
    if (!complex) return res.status(403).json({ message: 'Not authorized.' });

    const { url } = req.body;
    if (!(court.photos || []).includes(url)) return res.status(400).json({ message: 'Photo not found in court.' });

    court.photo = url;
    await court.save();

    res.json({ photo: court.photo });
  } catch (error) {
    res.status(500).json({ message: 'Error setting principal photo.', error: error.message });
  }
};

export const getCourtsSchedule = async (req, res) => {
  try {
    let complexId;
    if (req.user.role === 'superadmin') {
      if (!req.query.complexId) {
        return res.status(400).json({ message: 'Se requiere complexId en query para superadmin' });
      }
      complexId = req.query.complexId;
    } else {
      complexId = req.user.complexId;
      if (!complexId) {
        const owned = await Complex.findOne({ owner: req.user._id });
        if (!owned) return res.status(403).json({ message: 'Usuario sin complejo asignado' });
        complexId = owned._id;
      } else {
        const complex = await getComplexIfOwner(complexId, req.user._id, req.user.role);
        if (!complex) return res.status(403).json({ message: 'No autorizado para este complejo' });
      }
    }

    const courts = await Court.find({ complex: complexId }).sort({ createdAt: 1 });

    const Blockout = (await import('../models/Blockout.js')).default;
    const blockouts = await Blockout.find({ complexId, isActive: true });

    const result = courts.map(court => {

      const courtBlocks = blockouts.filter(
        b => !b.courtId || b.courtId.toString() === court._id.toString()
      );

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => ({
        day,
        openTime: court.schedule?.[day]?.start || '--',
        closeTime: court.schedule?.[day]?.end || '--',
        active: court.schedule?.[day]?.enabled ?? false,
      }));

      return {
        courtId: court._id,
        courtName: court.name,
        active: court.enabled ?? true,
        days,
        blocks: courtBlocks.map(b => ({
          id: b._id,
          name: b.name,
          recurrence: b.recurrence,
          day: b.dayOfWeek,
          startTime: b.startTime,
          endTime: b.endTime,
          courtId: b.courtId ?? null,
        })),

      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener horarios.', error: error.message });
  }
};

export const updateCourtSchedule = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { active, days } = req.body;

    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Cancha no encontrada.' });
    }

    let complexId;
    if (req.user.role === 'superadmin') {
      if (!req.body.complexId) {
        return res.status(400).json({ message: 'Se requiere complexId para superadmin' });
      }
      complexId = req.body.complexId;
    } else {
      complexId = req.user.complexId;
      if (!complexId) {
        const owned = await Complex.findOne({ owner: req.user._id });
        if (!owned) return res.status(403).json({ message: 'Usuario sin complejo asignado' });
        complexId = owned._id;
      } else {
        const complex = await getComplexIfOwner(complexId, req.user._id, req.user.role);
        if (!complex) return res.status(403).json({ message: 'No autorizado para modificar esta cancha' });
      }
    }

    if (court.complex.toString() !== complexId.toString()) {
      return res.status(403).json({ message: 'La cancha no pertenece a este complejo' });
    }

    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ message: 'El campo days es requerido y debe ser un arreglo.' });
    }

    const schedule = {};
    days.forEach(d => {
      if (!d.day) return;
      schedule[d.day] = {
        enabled: Boolean(d.active),
        start: (d.openTime && d.openTime !== '--') ? d.openTime : '08:00',
        end: (d.closeTime && d.closeTime !== '--') ? d.closeTime : '22:00',
      };
    });

    court.schedule = schedule;
    if (active !== undefined) court.enabled = Boolean(active);
    await court.save();

    res.json({ message: 'Horarios actualizados correctamente.', court });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar horarios.', error: error.message });
  }
};
