const Complejo = require('../models/Complejo');

const toDTO = (c) => ({ ...c.toObject(), id: c._id });

// GET /api/admin/complejos
const getAllComplejos = async (req, res) => {
  try {
    const complejos = await Complejo.find().sort({ createdAt: -1 });
    res.json({ data: complejos.map(toDTO) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complejos.', error: error.message });
  }
};

// POST /api/admin/complejos
const createComplejo = async (req, res) => {
  try {
    const complejo = await Complejo.create(req.body);
    res.status(201).json({ data: toDTO(complejo) });
  } catch (error) {
    res.status(500).json({ message: 'Error creating complejo.', error: error.message });
  }
};

// PUT /api/admin/complejos/:id
const updateComplejo = async (req, res) => {
  try {
    const complejo = await Complejo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado.' });
    res.json({ data: toDTO(complejo) });
  } catch (error) {
    res.status(500).json({ message: 'Error updating complejo.', error: error.message });
  }
};

// DELETE /api/admin/complejos/:id
const deleteComplejo = async (req, res) => {
  try {
    const complejo = await Complejo.findByIdAndDelete(req.params.id);
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado.' });
    res.json({ message: 'Complejo eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting complejo.', error: error.message });
  }
};

// PATCH /api/admin/complejos/:id/approve
const approveComplejo = async (req, res) => {
  try {
    const complejo = await Complejo.findByIdAndUpdate(
      req.params.id, { status: 'APPROVED' }, { new: true }
    );
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado.' });
    res.json({ data: toDTO(complejo) });
  } catch (error) {
    res.status(500).json({ message: 'Error approving complejo.', error: error.message });
  }
};

// PATCH /api/admin/complejos/:id/reject
const rejectComplejo = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const complejo = await Complejo.findByIdAndUpdate(
      req.params.id, { status: 'REJECTED', observations: reason }, { new: true }
    );
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado.' });
    res.json({ data: toDTO(complejo) });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting complejo.', error: error.message });
  }
};

// PATCH /api/admin/complejos/:id/suspend
const suspendComplejo = async (req, res) => {
  try {
    const complejo = await Complejo.findByIdAndUpdate(
      req.params.id, { status: 'SUSPENDED' }, { new: true }
    );
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado.' });
    res.json({ data: toDTO(complejo) });
  } catch (error) {
    res.status(500).json({ message: 'Error suspending complejo.', error: error.message });
  }
};

module.exports = {
  getAllComplejos, createComplejo, updateComplejo, deleteComplejo,
  approveComplejo, rejectComplejo, suspendComplejo,
};
