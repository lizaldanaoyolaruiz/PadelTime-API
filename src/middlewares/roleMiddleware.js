// Fábrica de middleware de rol — permite reutilizar para cualquier combinación de roles
const soloRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ mensaje: `Acceso restringido. Roles permitidos: ${roles.join(', ')}.` });
  }
  next();
};

export const soloOwner = soloRoles('owner', 'admin');
export const soloAdmin = soloRoles('admin');
export const soloPlayer = soloRoles('player', 'admin');

export default soloRoles;
