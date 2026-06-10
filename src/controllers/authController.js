import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { enviarBienvenida } from '../services/emailService.js';

const formatearUsuario = (user) => ({
  id: user._id,
  nombre: user.nombre,
  email: user.email,
  role: user.role,
});

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { nombre, email, password, confirmPassword, role } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y contraseña son obligatorios.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ mensaje: 'Las contraseñas no coinciden.' });
    }

    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: 'El email ya está registrado.' });

    // Solo se puede auto-registrar como owner o player; admin solo vía consola
    const rolPermitido = ['owner', 'player'].includes(role) ? role : 'player';

    const user = await User.create({ nombre, email, password, role: rolPermitido });

    const token = generateToken(user);

    // Email de bienvenida — no bloqueamos la respuesta si falla
    enviarBienvenida({ nombre: user.nombre, email: user.email, role: user.role }).catch((err) =>
      console.error('[emailService] Error al enviar bienvenida:', err.message)
    );

    res.status(201).json({ token, user: formatearUsuario(user) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario.', error: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios.' });
    }

    // select('+password') porque el campo tiene select: false en el schema
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.compararPassword(password))) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });
    }

    const token = generateToken(user);

    res.json({ token, user: formatearUsuario(user) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión.', error: error.message });
  }
};

// GET /api/auth/me  (requiere token)
export const getMe = async (req, res) => {
  res.json({ user: formatearUsuario(req.user) });
};
