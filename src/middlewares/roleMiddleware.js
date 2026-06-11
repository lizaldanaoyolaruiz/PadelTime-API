const soloRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: 'No tenés permisos para esta acción' });
  }
  next();
};

export const soloOwner = soloRoles('owner', 'admin');
export const soloAdmin = soloRoles('admin');
export const soloPlayer = soloRoles('player', 'admin');
export const soloSuperAdmin = soloRoles('SUPER_ADMIN');
export const requireRole = (role) => soloRoles(role);

export default soloRoles;
