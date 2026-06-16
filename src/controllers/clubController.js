const Club = require('../models/Club');

const toDTO = (c) => ({ ...c.toObject(), id: c._id });

// GET /api/admin/clubs
const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().sort({ createdAt: -1 });
    res.json({ data: clubs.map(toDTO) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clubs.', error: error.message });
  }
};

// POST /api/admin/clubs
const createClub = async (req, res) => {
  try {
    const club = await Club.create(req.body);
    res.status(201).json({ data: toDTO(club) });
  } catch (error) {
    res.status(500).json({ message: 'Error creating club.', error: error.message });
  }
};

// PUT /api/admin/clubs/:id
const updateClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    res.json({ data: toDTO(club) });
  } catch (error) {
    res.status(500).json({ message: 'Error updating club.', error: error.message });
  }
};

// DELETE /api/admin/clubs/:id
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    res.json({ message: 'Club deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting club.', error: error.message });
  }
};

// PATCH /api/admin/clubs/:id/approve
const approveClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id, { status: 'APPROVED' }, { new: true }
    );
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    res.json({ data: toDTO(club) });
  } catch (error) {
    res.status(500).json({ message: 'Error approving club.', error: error.message });
  }
};

// PATCH /api/admin/clubs/:id/reject
const rejectClub = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const club = await Club.findByIdAndUpdate(
      req.params.id, { status: 'REJECTED', observations: reason }, { new: true }
    );
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    res.json({ data: toDTO(club) });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting club.', error: error.message });
  }
};

// PATCH /api/admin/clubs/:id/suspend
const suspendClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id, { status: 'SUSPENDED' }, { new: true }
    );
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    res.json({ data: toDTO(club) });
  } catch (error) {
    res.status(500).json({ message: 'Error suspending club.', error: error.message });
  }
};

module.exports = {
  getAllClubs, createClub, updateClub, deleteClub,
  approveClub, rejectClub, suspendClub,
};
