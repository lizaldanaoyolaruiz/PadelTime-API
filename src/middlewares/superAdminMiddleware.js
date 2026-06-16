// Middleware exclusivo de SuperAdmin.
// No reimplementa auth/roles: solo compone los middlewares genéricos
// ya existentes (authMiddleware.js, roleMiddleware.js) para exponer
// un único guard reutilizable en las rutas de SuperAdmin.
const { authMiddleware } = require('./authMiddleware');
const { roleMiddleware } = require('./roleMiddleware');

const protectSuperAdmin = [authMiddleware, roleMiddleware(['superadmin'])];

module.exports = { protectSuperAdmin };
