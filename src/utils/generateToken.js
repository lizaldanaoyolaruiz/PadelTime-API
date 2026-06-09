import jwt from 'jsonwebtoken';

// Incluye el rol en el payload para que el middleware pueda validarlo sin ir a la BD
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

export default generateToken;
