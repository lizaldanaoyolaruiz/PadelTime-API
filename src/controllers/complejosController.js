import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import Complejo from '../models/Complejo.js';

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

// POST /api/complejos
export const crearComplejo = async (req, res) => {
  try {
    const existe = await Complejo.findOne({ owner: req.user._id });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya tenés un complejo registrado.' });
    }

    const { nombre, direccion, whatsapp, instagram, porcentaje_sena } = req.body;

    if (!nombre || !direccion) {
      return res.status(400).json({ mensaje: 'Nombre y dirección son obligatorios.' });
    }

    const complejo = await Complejo.create({
      owner: req.user._id,
      nombre,
      direccion,
      whatsapp,
      instagram,
      porcentaje_sena,
      estado: 'pendiente',
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

    // Enmascarar la key — solo mostrar los últimos 4 caracteres
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
      'nombre', 'direccion', 'whatsapp', 'instagram',
      'porcentaje_sena', 'mercadopago_public_key', 'mercadopago_activo',
    ];

    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) complejo[campo] = req.body[campo];
    });

    await complejo.save();

    const data = complejo.toObject();
    delete data.mercadopago_public_key; // nunca devolver la key completa
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
    await complejo.save();

    // Elimina de Cloudinary usando el public_id
    const segments = url.split('/');
    const fileWithExt = segments[segments.length - 1];
    const publicId = `padeltime/complejos/${complejo._id}/${fileWithExt.split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);

    res.json({ fotos: complejo.fotos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar foto.', error: error.message });
  }
};
