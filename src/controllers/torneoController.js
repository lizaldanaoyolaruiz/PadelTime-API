import Torneo from '../models/Torneo.js';
import Complex from '../models/Complex.js';

const POPULATE_COMPLEJO = { path: 'complejo', select: 'name' };

export const getTorneos = async (req, res) => {
  try {
    const { estado } = req.query;
    const filter = {};
    if (estado && ['activo', 'finalizado', 'cancelado'].includes(estado)) {
      filter.estado = estado;
    }
    const torneos = await Torneo.find(filter)
      .populate(POPULATE_COMPLEJO)
      .sort({ fechaInicio: 1 });
    res.json({ torneos });
  } catch {
    res.status(500).json({ message: 'Error al obtener los torneos.' });
  }
};

export const getTorneoById = async (req, res) => {
  try {
    const torneo = await Torneo.findById(req.params.id).populate(POPULATE_COMPLEJO);
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado.' });
    res.json({ torneo });
  } catch {
    res.status(500).json({ message: 'Error al obtener el torneo.' });
  }
};

export const createTorneo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.body;
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      return res.status(400).json({ message: 'La fecha de fin no puede ser anterior a la de inicio.' });
    }
    const complex = await Complex.findOne({ owner: req.user._id });
    const torneo = await Torneo.create({
      ...req.body,
      complejo: complex?._id ?? undefined,
    });
    await torneo.populate(POPULATE_COMPLEJO);
    res.status(201).json({ torneo });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTorneo = async (req, res) => {
  try {
    const existing = await Torneo.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Torneo no encontrado.' });

    const fechaInicio = req.body.fechaInicio ?? existing.fechaInicio;
    const fechaFin    = req.body.fechaFin    ?? existing.fechaFin;
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      return res.status(400).json({ message: 'La fecha de fin no puede ser anterior a la de inicio.' });
    }

    const torneo = await Torneo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(POPULATE_COMPLEJO);
    res.json({ torneo });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTorneo = async (req, res) => {
  try {
    const torneo = await Torneo.findByIdAndDelete(req.params.id);
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado.' });
    res.json({ message: 'Torneo eliminado correctamente.' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar el torneo.' });
  }
};
