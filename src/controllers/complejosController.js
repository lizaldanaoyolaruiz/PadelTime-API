import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import Complejo from '../models/Complejo.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

const subirImagen = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });

const esOwnerOAdmin = (complejo, userId, role) =>
  complejo.owner.toString() === userId.toString() || role === 'admin';

// ─── OWNER ENDPOINTS ─────────────────────────────────────────────────────────

// POST /api/complejos
export const crearComplejo = async (req, res) => {
  try {
    const existe = await Complejo.findOne({ owner: req.user._id });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya tenés un complejo registrado.' });
    }

    const { name, location, city, whatsapp, instagram, porcentaje_sena, price, openTime, closeTime, courts } = req.body;

    if (!name || !location) {
      return res.status(400).json({ mensaje: 'Nombre y ubicación son obligatorios.' });
    }

    const complejo = await Complejo.create({
      owner: req.user._id,
      name,
      location,
      city,
      whatsapp,
      instagram,
      porcentaje_sena,
      price,
      openTime,
      closeTime,
      courts,
      status: 'pending',
    });

    res.status(201).json({ complejo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear complejo.', error: error.message });
  }
};

// GET /api/complejos/me
export const getMiComplejo = async (req, res) => {
  try {
    const complejo = await Complejo.findOne({ owner: req.user._id }).select(
      '+mercadopago_public_key'
    );

    if (!complejo) {
      return res.status(404).json({ mensaje: 'No tenés ningún complejo registrado.' });
    }

    const data = complejo.toObject();
    if (data.mercadopago_public_key) {
      data.mercadopago_public_key = '••••••••' + data.mercadopago_public_key.slice(-4);
    }

    res.json({ complejo: data });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener complejo.', error: error.message });
  }
};

// PUT /api/complejos/:id
export const actualizarComplejo = async (req, res) => {
  try {
    const complejo = await Complejo.findById(req.params.id);
    if (!complejo) return res.status(404).json({ mensaje: 'Complejo no encontrado.' });

    if (!esOwnerOAdmin(complejo, req.user._id, req.user.role)) {
      return res.status(403).json({ mensaje: 'No tenés permiso para editar este complejo.' });
    }

    const campos = [
      'name', 'location', 'city', 'whatsapp', 'instagram',
      'porcentaje_sena', 'mercadopago_public_key', 'mercadopago_activo',
      'price', 'openTime', 'closeTime', 'courts', 'image',
    ];

    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) complejo[campo] = req.body[campo];
    });

    await complejo.save();

    const data = complejo.toObject();
    delete data.mercadopago_public_key;
    res.json({ complejo: data });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar complejo.', error: error.message });
  }
};

// POST /api/complejos/:id/fotos
export const subirFotos = async (req, res) => {
  try {
    const complejo = await Complejo.findById(req.params.id);
    if (!complejo) return res.status(404).json({ mensaje: 'Complejo no encontrado.' });

    if (!esOwnerOAdmin(complejo, req.user._id, req.user.role)) {
      return res.status(403).json({ mensaje: 'Sin permiso para subir fotos.' });
    }

    if (!req.files?.length) {
      return res.status(400).json({ mensaje: 'No se enviaron imágenes.' });
    }

    const resultados = await Promise.all(
      req.files.map((f) => subirImagen(f.buffer, `padeltime/complejos/${complejo._id}`))
    );

    complejo.fotos.push(...resultados.map((r) => r.secure_url));
    if (!complejo.image) complejo.image = resultados[0].secure_url;
    await complejo.save();

    res.json({ fotos: complejo.fotos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir fotos.', error: error.message });
  }
};

// DELETE /api/complejos/:id/fotos  — body: { url }
export const eliminarFoto = async (req, res) => {
  try {
    const complejo = await Complejo.findById(req.params.id);
    if (!complejo) return res.status(404).json({ mensaje: 'Complejo no encontrado.' });

    if (!esOwnerOAdmin(complejo, req.user._id, req.user.role)) {
      return res.status(403).json({ mensaje: 'Sin permiso para eliminar fotos.' });
    }

    const { url } = req.body;
    complejo.fotos = complejo.fotos.filter((f) => f !== url);
    if (complejo.image === url) complejo.image = complejo.fotos[0] || null;
    await complejo.save();

    const segments = url.split('/');
    const fileWithExt = segments[segments.length - 1];
    const publicId = `padeltime/complejos/${complejo._id}/${fileWithExt.split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);

    res.json({ fotos: complejo.fotos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar foto.', error: error.message });
  }
};

// ─── SUPER ADMIN ENDPOINTS ────────────────────────────────────────────────────

// GET /api/complexes/admin
export const getAdminComplejos = async (req, res) => {
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

    const [complejos, total, pending, approved, rejected, suspended] = await Promise.all([
      Complejo.find(filter)
        .populate('owner', 'nombre apellido email')
        .sort({ createdAt: -1 }),
      Complejo.countDocuments(),
      Complejo.countDocuments({ status: 'pending' }),
      Complejo.countDocuments({ status: 'approved' }),
      Complejo.countDocuments({ status: 'rejected' }),
      Complejo.countDocuments({ status: 'suspended' }),
    ]);

    res.json({
      data: complejos,
      stats: { total, pending, approved, rejected, suspended },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PATCH /api/complexes/:id/approve
export const aprobarComplejo = async (req, res) => {
  try {
    const complejo = await Complejo.findById(req.params.id).populate('owner', 'nombre apellido email');
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado' });

    complejo.status = 'approved';
    complejo.rejectReason = undefined;
    await complejo.save();

    await ActivityLog.create({
      action: 'approved',
      complexId: complejo._id,
      complexName: complejo.name,
      adminId: req.user._id,
      adminName: `${req.user.nombre} ${req.user.apellido || ''}`.trim(),
    });

    sendApprovalEmail(complejo).catch((err) =>
      console.error('[emailService] Error al enviar aprobación:', err.message)
    );

    res.json({ message: 'Complejo aprobado exitosamente', complex: complejo });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PATCH /api/complexes/:id/reject
export const rechazarComplejo = async (req, res) => {
  try {
    const { reason } = req.body;
    const complejo = await Complejo.findById(req.params.id).populate('owner', 'nombre apellido email');
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado' });

    complejo.status = 'rejected';
    complejo.rejectReason = reason;
    await complejo.save();

    await ActivityLog.create({
      action: 'rejected',
      complexId: complejo._id,
      complexName: complejo.name,
      adminId: req.user._id,
      adminName: `${req.user.nombre} ${req.user.apellido || ''}`.trim(),
      reason,
    });

    sendRejectionEmail(complejo, reason).catch((err) =>
      console.error('[emailService] Error al enviar rechazo:', err.message)
    );

    res.json({ message: 'Complejo rechazado', complex: complejo });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PATCH /api/complexes/:id/suspend
export const suspenderComplejo = async (req, res) => {
  try {
    const { reason } = req.body;
    const complejo = await Complejo.findById(req.params.id).populate('owner', 'nombre apellido email');
    if (!complejo) return res.status(404).json({ message: 'Complejo no encontrado' });

    complejo.status = 'suspended';
    complejo.rejectReason = reason;
    await complejo.save();

    await ActivityLog.create({
      action: 'suspended',
      complexId: complejo._id,
      complexName: complejo.name,
      adminId: req.user._id,
      adminName: `${req.user.nombre} ${req.user.apellido || ''}`.trim(),
      reason,
    });

    res.json({ message: 'Complejo suspendido', complex: complejo });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/complexes/activity
export const getActivityLog = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
