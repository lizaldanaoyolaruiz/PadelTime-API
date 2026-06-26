import { Readable } from 'stream';
import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';
import cloudinary from '../config/cloudinary.js';
import Complex from '../models/Complex.js';
import Court from '../models/Court.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

const uploadImage = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });

const isOwner = (complex, userId) =>
  complex.owner.toString() === userId.toString();

export const getFeaturedComplexes = async (req, res) => {
  try {
    const filter = { status: 'approved' };
    if (req.query.isFeatured === 'true') filter.isFeatured = true;

    const complexes = await Complex.find(filter)
      .select('name location price ratingAverage image openTime closeTime')
      .sort({ ratingAverage: -1 })
      .limit(6);

    const data = complexes.map((c) => ({
      id: c._id,
      name: c.name,
      location: c.location,
      price: c.price,
      rating: c.ratingAverage,
      image: c.image,
      time: c.openTime && c.closeTime ? `${c.openTime} - ${c.closeTime}` : null,
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complexes.', error: error.message });
  }
};

export const getPublicComplexes = async (req, res) => {
  try {
    const complejos = await Complex.find({ status: 'approved' })
      .select('name location city price ratingAverage ratingCount photos image description openTime closeTime')
      .lean();

    if (complejos.length === 0) {
      return res.json({ complexes: [] });
    }

    // Traer todas las canchas habilitadas de esos complejos
    const ids = complejos.map(c => c._id);
    const canchas = await Court.find({ complex: { $in: ids }, enabled: true })
      .select('complex type features pricePerHour schedule')
      .lean();

    // Agrupar canchas por complejo
    const canchasPorComplejo = {};
    for (const cancha of canchas) {
      const id = cancha.complex.toString();
      if (!canchasPorComplejo[id]) canchasPorComplejo[id] = [];
      canchasPorComplejo[id].push(cancha);
    }

    const tipoEnEspanol = { crystal: 'Cristal', panoramic: 'Panorámica' };

    // Devuelve las franjas horarias que cubre una cancha según su horario
    const getFranjasDeCancha = (cancha) => {
      const franjas = [];
      const dias = Object.values(cancha.schedule || {});

      for (const dia of dias) {
        if (!dia?.enabled) continue;
        const inicio = parseInt(dia.start?.split(':')[0] || '0', 10);
        const fin = parseInt(dia.end?.split(':')[0] || '0', 10);

        if (inicio < 12 && fin > 6 && !franjas.includes('Mañana')) franjas.push('Mañana');
        if (inicio < 18 && fin > 12 && !franjas.includes('Tarde')) franjas.push('Tarde');
        if (inicio < 24 && fin > 18 && !franjas.includes('Noche')) franjas.push('Noche');
        if (inicio < 6 && !franjas.includes('Madrugada')) franjas.push('Madrugada');
      }
      return franjas;
    };

    // Armar la respuesta enriquecida con datos de canchas
    const resultado = complejos.map(complejo => {
      const canchasDelComplejo = canchasPorComplejo[complejo._id.toString()] || [];

      // Precio: se usa el del complejo como valor principal; canchas como fallback
      const precios = canchasDelComplejo
        .filter(c => c.pricePerHour > 0)
        .map(c => c.pricePerHour);
      const precioPorHora = complejo.price || (precios.length > 0 ? Math.min(...precios) : 0);

      // Features únicas de todas las canchas
      const features = [];
      for (const cancha of canchasDelComplejo) {
        for (const feature of (cancha.features || [])) {
          if (!features.includes(feature)) features.push(feature);
        }
      }

      // Tipos de cancha únicos traducidos al español
      const courtTypes = [];
      for (const cancha of canchasDelComplejo) {
        const tipo = tipoEnEspanol[cancha.type] || cancha.type;
        if (!courtTypes.includes(tipo)) courtTypes.push(tipo);
      }

      // Franjas horarias disponibles en el complejo
      const franjas = [];
      for (const cancha of canchasDelComplejo) {
        for (const franja of getFranjasDeCancha(cancha)) {
          if (!franjas.includes(franja)) franjas.push(franja);
        }
      }

      return { ...complejo, precioPorHora, features, courtTypes, franjas };
    });

    res.json({ complexes: resultado });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los complejos.', error: error.message });
  }
};

export const getPublicComplexById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Complex not found.' });
    }

    const complex = await Complex.findOne({ _id: id, status: 'approved' });
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    res.json({ complex });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complex.', error: error.message });
  }
};

export const createComplex = async (req, res) => {
  try {
    const exists = await Complex.findOne({ owner: req.user._id });
    if (exists) return res.status(400).json({ message: 'You already have a registered complex.' });

    const { name, address, city, description, whatsapp, instagram, depositPercentage, price, openTime, closeTime } = req.body;

    const complex = await Complex.create({
      owner: req.user._id,
      name, location: address, city, description, whatsapp, instagram,
      depositPercentage, price, openTime, closeTime,
      status: 'pending',
    });

    res.status(201).json({ complex });
  } catch (error) {
    res.status(500).json({ message: 'Error creating complex.', error: error.message });
  }
};

const CIUDADES_VALIDAS = ['San Miguel de Tucumán', 'Tafí Viejo', 'Yerba Buena'];

export const getCities = async (req, res) => {
  try {
    const rawCities = await Complex.distinct('city', { status: 'approved' });
    const ciudades = CIUDADES_VALIDAS.filter(ciudadValida =>
      rawCities.some(c => c?.trim().toLowerCase() === ciudadValida.toLowerCase())
    );
    return res.json({ ciudades });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener ciudades.', error: error.message });
  }
};

export const getMyComplexes = async (req, res) => {
  try {
    const complexes = await Complex.find({ owner: req.user._id }).select('_id name city status').lean();
    res.json({ complexes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complexes.', error: error.message });
  }
};

export const getMyComplex = async (req, res) => {
  try {
    const filtro = req.query.complexId
      ? { _id: req.query.complexId, owner: req.user._id }
      : { owner: req.user._id };

    const complex = await Complex.findOne(filtro).select('+mercadopagoPublicKey +mpAccessToken');
    if (!complex) return res.status(404).json({ message: 'No complex registered.' });

    const data = complex.toObject();
    if (data.mercadopagoPublicKey) {
      data.mercadopagoPublicKey = '••••••••' + data.mercadopagoPublicKey.slice(-4);
    }
    data.mpTokenConfigured = !!data.mpAccessToken;
    delete data.mpAccessToken;

    res.json({ complex: data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complex.', error: error.message });
  }
};

export const deleteMpToken = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complejo no encontrado.' });

    if (!isOwner(complex, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'No autorizado.' });
    }

    complex.mpAccessToken      = undefined;
    complex.mercadopagoPublicKey = undefined;
    complex.mercadopagoActive  = false;
    await complex.save();

    return res.json({ message: 'Token de Mercado Pago eliminado correctamente.', mercadopagoActive: false });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el token.', error: error.message });
  }
};

export const updateComplex = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwner(complex, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to edit this complex.' });
    }

    const fields = [
      'name', 'city', 'description', 'whatsapp', 'instagram',
      'depositPercentage', 'mercadopagoPublicKey', 'mercadopagoActive',
      'price', 'openTime', 'closeTime', 'image',
    ];
    fields.forEach((f) => { if (req.body[f] !== undefined) complex[f] = req.body[f]; });
    if (req.body.address !== undefined) complex.location = req.body.address;

    if (req.body.mpAccessToken?.trim()) {
      complex.mpAccessToken = encrypt(req.body.mpAccessToken.trim());
      complex.mercadopagoActive = true;
    }

    await complex.save();
    const data = complex.toObject();
    delete data.mercadopagoPublicKey;
    delete data.mpAccessToken;

    res.json({ complex: data });
  } catch (error) {
    res.status(500).json({ message: 'Error updating complex.', error: error.message });
  }
};

export const createComplexByAdmin = async (req, res) => {
  try {
    const { name, ownerEmail, city, address, observations } = req.body;

    const ownerUser = await User.findOne({ email: ownerEmail.toLowerCase().trim() });
    if (!ownerUser) {
      return res.status(404).json({ message: 'No se encontró un usuario con ese email.' });
    }
    if (ownerUser.role !== 'admin') {
      return res.status(400).json({ message: 'El usuario debe tener rol de propietario (admin).' });
    }

    const exists = await Complex.findOne({ owner: ownerUser._id });
    if (exists) {
      return res.status(400).json({ message: 'Este propietario ya tiene un complejo registrado.' });
    }

    const complex = await Complex.create({
      owner: ownerUser._id,
      name, city, location: address, observations,
      status: 'approved',
    });

    res.status(201).json({ complex });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el complejo.', error: error.message });
  }
};

export const uploadPhotos = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwner(complex, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No images provided.' });
    }

    const results = await Promise.all(
      req.files.map((f) => uploadImage(f.buffer, `padeltime/complexes/${complex._id}`))
    );

    complex.photos.push(...results.map((r) => r.secure_url));
    if (!complex.image) complex.image = results[0].secure_url;
    await complex.save();

    res.json({ photos: complex.photos });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photos.', error: error.message });
  }
};

export const setPrincipalPhoto = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwner(complex, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const { url } = req.body;
    if (!complex.photos.includes(url)) {
      return res.status(400).json({ message: 'La foto no pertenece a este complejo.' });
    }

    complex.image = url;
    await complex.save();

    res.json({ image: complex.image });
  } catch (error) {
    res.status(500).json({ message: 'Error al establecer foto principal.', error: error.message });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (!isOwner(complex, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const { url } = req.body;
    complex.photos = complex.photos.filter((p) => p !== url);
    if (complex.image === url) complex.image = complex.photos[0] || null;
    await complex.save();

    const segments = url.split('/');
    const publicId = `padeltime/complexes/${complex._id}/${segments[segments.length - 1].split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);

    res.json({ photos: complex.photos });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting photo.', error: error.message });
  }
};

export const getAdminComplexes = async (req, res) => {
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

    const [complexes, total, pending, approved, rejected, suspended] = await Promise.all([
      Complex.find(filter).populate('owner', 'name email').sort({ createdAt: -1 }),
      Complex.countDocuments(),
      Complex.countDocuments({ status: 'pending' }),
      Complex.countDocuments({ status: 'approved' }),
      Complex.countDocuments({ status: 'rejected' }),
      Complex.countDocuments({ status: 'suspended' }),
    ]);

    res.json({ data: complexes, stats: { total, pending, approved, rejected, suspended } });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const approveComplex = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id).populate('owner', 'name email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'approved';
    complex.rejectReason = undefined;
    await complex.save();

    await ActivityLog.create({
      action: 'approved',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: req.user.name,
    });

    sendApprovalEmail(complex.owner).catch((err) =>
      console.error('[email] Approval error:', err.message)
    );

    res.json({ message: 'Complex approved.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const rejectComplex = async (req, res) => {
  try {
    const { reason } = req.body;
    const complex = await Complex.findById(req.params.id).populate('owner', 'name email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'rejected';
    complex.rejectReason = reason;
    await complex.save();

    await ActivityLog.create({
      action: 'rejected',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: req.user.name,
      reason,
    });

    sendRejectionEmail(complex.owner, reason).catch((err) =>
      console.error('[email] Rejection error:', err.message)
    );

    res.json({ message: 'Complex rejected.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const suspendComplex = async (req, res) => {
  try {
    const { reason } = req.body;
    const complex = await Complex.findById(req.params.id).populate('owner', 'name email');
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.status = 'suspended';
    complex.rejectReason = reason;
    await complex.save();

    await ActivityLog.create({
      action: 'suspended',
      complexId: complex._id,
      complexName: complex.name,
      adminId: req.user._id,
      adminName: req.user.name,
      reason,
    });

    res.json({ message: 'Complex suspended.', complex });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    complex.isFeatured = !complex.isFeatured;
    await complex.save();

    res.json({ isFeatured: complex.isFeatured });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteComplex = async (req, res) => {
  try {
    const complex = await Complex.findByIdAndDelete(req.params.id);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });
    res.json({ message: 'Complex deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getConfig = async (req, res) => {
  try {
    const { complexId } = req.params;
    const complex = await Complex.findById(complexId);
    if (!complex) {
      return res.status(404).json({ message: 'Complejo no encontrado' });
    }
    res.json({
      onlineStatus: complex.onlineStatus ?? true,
      publicBookingEnabled: complex.publicBookingEnabled ?? true,
      openTime: complex.openTime || '08:00 AM',
      closeTime: complex.closeTime || '11:00 PM',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { complexId } = req.params;
    const { onlineStatus, publicBookingEnabled, openTime, closeTime } = req.body;

    // Validar permisos según rol (similar a otros controladores)
    const complex = await Complex.findByIdAndUpdate(
      complexId,
      { onlineStatus, publicBookingEnabled, openTime, closeTime },
      { new: true, runValidators: true }
    );
    if (!complex) {
      return res.status(404).json({ message: 'Complejo no encontrado' });
    }
    res.json(complex);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};