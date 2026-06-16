// Service exclusivo de SuperAdmin: contiene la lógica de negocio para
// moderar complejos (listar, aprobar, rechazar, suspender). El controller
// solo se encarga de req/res; toda la consulta a la base la hace este service.
const Complex = require('../models/Complex');
const ActivityLog = require('../models/ActivityLog');

const buildFilter = ({ status, search }) => {
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }
  return filter;
};

const logActivity = (action, complejo, admin, reason) =>
  ActivityLog.create({
    action,
    complexId: complejo._id,
    complexName: complejo.name,
    adminId: admin._id,
    adminName: admin.name,
    ...(reason ? { reason } : {}),
  });

// Lista los complejos (modelo Complex, el que alimenta el portal público)
// con filtros opcionales de status/búsqueda y métricas para el dashboard.
const listComplejos = async ({ status, search }) => {
  const filter = buildFilter({ status, search });

  const [complejos, total, pending, approved, rejected, suspended] = await Promise.all([
    Complex.find(filter).populate('owner', 'name email').sort({ createdAt: -1 }),
    Complex.countDocuments(),
    Complex.countDocuments({ status: 'pending' }),
    Complex.countDocuments({ status: 'approved' }),
    Complex.countDocuments({ status: 'rejected' }),
    Complex.countDocuments({ status: 'suspended' }),
  ]);

  return { complejos, stats: { total, pending, approved, rejected, suspended } };
};

// Aprueba: status "approved" → visible en el portal público. Sin email.
const aprobarComplejo = async (id, admin) => {
  const complejo = await Complex.findById(id);
  if (!complejo) return null;

  complejo.status = 'approved';
  complejo.rejectReason = undefined;
  await complejo.save();

  await logActivity('approved', complejo, admin);
  return complejo;
};

// Rechaza: status "rejected". Sin email.
const rechazarComplejo = async (id, admin, reason = '') => {
  const complejo = await Complex.findById(id);
  if (!complejo) return null;

  complejo.status = 'rejected';
  complejo.rejectReason = reason;
  await complejo.save();

  await logActivity('rejected', complejo, admin, reason);
  return complejo;
};

// Suspende: status "suspended" → deja de aparecer en el portal de inmediato. Sin email.
const suspenderComplejo = async (id, admin, reason = '') => {
  const complejo = await Complex.findById(id);
  if (!complejo) return null;

  complejo.status = 'suspended';
  complejo.rejectReason = reason;
  await complejo.save();

  await logActivity('suspended', complejo, admin, reason);
  return complejo;
};

module.exports = {
  listComplejos,
  aprobarComplejo,
  rechazarComplejo,
  suspenderComplejo,
};
