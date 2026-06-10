import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import Cancha from '../models/Cancha.js';
import Complejo from '../models/Complejo.js';

const subirImagen = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });

// Verifica que el usuario sea owner del complejo
const getComplejoSiEsOwner = async (complejoId, userId, role) => {
  const complejo = await Complejo.findById(complejoId);
  if (!complejo) return null;
  if (complejo.owner.toString() !== userId.toString() && role !== 'admin') return null;
  return complejo;
};

// POST /api/canchas
export const crearCancha = async (req, res) => {
  try {
    const { complejoId, nombre, tipo, descripcion, caracteristicas, precio_por_hora, agenda } =
      req.body;

    if (!complejoId || !nombre || !tipo || !precio_por_hora) {
      return res.status(400).json({ mensaje: 'complejoId, nombre, tipo y precio son obligatorios.' });
    }

    const complejo = await getComplejoSiEsOwner(complejoId, req.user._id, req.user.role);
    if (!complejo) {
      return res.status(403).json({ mensaje: 'Sin permiso para agregar canchas a este complejo.' });
    }

    let foto;
    if (req.file) {
      const result = await subirImagen(
        req.file.buffer,
        `padeltime/complejos/${complejoId}/canchas`
      );
      foto = result.secure_url;
    }

    const cancha = await Cancha.create({
      complejo: complejoId,
      nombre,
      tipo,
      descripcion,
      caracteristicas: caracteristicas || [],
      precio_por_hora,
      foto,
      agenda,
    });

    res.status(201).json({ cancha });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear cancha.', error: error.message });
  }
};

// GET /api/canchas?complejoId=...  (panel del owner — incluye deshabilitadas)
export const getCanchasPorComplejo = async (req, res) => {
  try {
    const { complejoId } = req.query;
    if (!complejoId) return res.status(400).json({ mensaje: 'complejoId es requerido.' });

    const complejo = await getComplejoSiEsOwner(complejoId, req.user._id, req.user.role);
    if (!complejo) {
      return res.status(403).json({ mensaje: 'Sin permiso para ver las canchas.' });
    }

    const canchas = await Cancha.find({ complejo: complejoId }).sort({ createdAt: 1 });
    res.json({ canchas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener canchas.', error: error.message });
  }
};

// PUT /api/canchas/:id
export const actualizarCancha = async (req, res) => {
  try {
    const cancha = await Cancha.findById(req.params.id);
    if (!cancha) return res.status(404).json({ mensaje: 'Cancha no encontrada.' });

    const complejo = await getComplejoSiEsOwner(cancha.complejo, req.user._id, req.user.role);
    if (!complejo) {
      return res.status(403).json({ mensaje: 'Sin permiso para editar esta cancha.' });
    }

    const campos = [
      'nombre', 'tipo', 'descripcion', 'caracteristicas',
      'precio_por_hora', 'habilitada', 'agenda',
    ];
    campos.forEach((c) => { if (req.body[c] !== undefined) cancha[c] = req.body[c]; });

    if (req.file) {
      const result = await subirImagen(
        req.file.buffer,
        `padeltime/complejos/${cancha.complejo}/canchas`
      );
      cancha.foto = result.secure_url;
    }

    await cancha.save();
    res.json({ cancha });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar cancha.', error: error.message });
  }
};

// DELETE /api/canchas/:id
export const eliminarCancha = async (req, res) => {
  try {
    const cancha = await Cancha.findById(req.params.id);
    if (!cancha) return res.status(404).json({ mensaje: 'Cancha no encontrada.' });

    const complejo = await getComplejoSiEsOwner(cancha.complejo, req.user._id, req.user.role);
    if (!complejo) {
      return res.status(403).json({ mensaje: 'Sin permiso para eliminar esta cancha.' });
    }

    await cancha.deleteOne();
    res.json({ mensaje: 'Cancha eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar cancha.', error: error.message });
  }
};

// GET /api/canchas/publicas?complejoId=...  (sin auth — portal público)
export const getCanchasPublicas = async (req, res) => {
  try {
    const { complejoId } = req.query;
    if (!complejoId) return res.status(400).json({ mensaje: 'complejoId es requerido.' });

    const canchas = await Cancha.find({ complejo: complejoId, habilitada: true }).sort({
      createdAt: 1,
    });
    res.json({ canchas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener canchas.', error: error.message });
  }
};
