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
    res.status(500).json({ message: 'Error creating court.', error: error.message });
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
        return res.status(403).json({ message: 'Usuario sin complejo asignado' });
      }
      
      const complex = await getComplexIfOwner(complexId, req.user._id, req.user.role);
      if (!complex) {
        return res.status(403).json({ message: 'No autorizado para este complejo' });
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
    const { id: courtId } = req.params;
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
    }

    if (req.user.role !== 'superadmin') {
      const complex = await getComplexIfOwner(complexId, req.user._id, req.user.role);
      if (!complex) {
        return res.status(403).json({ message: 'No autorizado para modificar esta cancha' });
      }
    }

    
    if (court.complex.toString() !== complexId.toString()) {
      return res.status(403).json({ message: 'La cancha no pertenece a este complejo' });
    }

    const schedule = {};
    days.forEach(d => {
      schedule[d.day] = {
        enabled: d.active,
        start: d.openTime,
        end: d.closeTime
      };
    });

    court.schedule = schedule;
    court.enabled = active;
    await court.save();

    res.json({ message: 'Horarios actualizados correctamente.', court });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar horarios.', error: error.message });
  }
};
