// Controller exclusivo de SuperAdmin: maneja req/res y delega toda la
// lógica de negocio al service (superAdminService.js).
const superAdminService = require('../services/superAdminService');

// GET /api/superadmin/complejos
const getAllComplejos = async (req, res) => {
  try {
    const { status, search } = req.query;
    const { complejos, stats } = await superAdminService.listComplejos({ status, search });
    res.json({ data: complejos, stats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complejos.', error: error.message });
  }
};

// PATCH /api/superadmin/complejos/:id/aprobar
const aprobarComplejo = async (req, res) => {
  try {
    const complejo = await superAdminService.aprobarComplejo(req.params.id, req.user);
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado.' });
    res.json({ data: complejo });
  } catch (error) {
    res.status(500).json({ message: 'Error approving complejo.', error: error.message });
  }
};

// PATCH /api/superadmin/complejos/:id/rechazar
const rechazarComplejo = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const complejo = await superAdminService.rechazarComplejo(req.params.id, req.user, reason);
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado.' });
    res.json({ data: complejo });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting complejo.', error: error.message });
  }
};

// PATCH /api/superadmin/complejos/:id/suspender
const suspenderComplejo = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const complejo = await superAdminService.suspenderComplejo(req.params.id, req.user, reason);
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado.' });
    res.json({ data: complejo });
  } catch (error) {
    res.status(500).json({ message: 'Error suspending complejo.', error: error.message });
  }
};

module.exports = {
  getAllComplejos,
  aprobarComplejo,
  rechazarComplejo,
  suspenderComplejo,
};
