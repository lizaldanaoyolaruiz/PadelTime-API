import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const proteger = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No autorizado. Token requerido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Solo busca el usuario para confirmar que sigue existiendo; el rol viene del token
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ mensaje: 'Usuario no encontrado.' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};
