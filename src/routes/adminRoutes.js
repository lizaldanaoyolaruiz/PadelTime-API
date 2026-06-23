import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminStatus,
  getStats,
  approveAdmin,
  rejectAdmin,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';

const router = Router();

router.use(protect, requireRole('superadmin'));

// Stats
router.get('/stats', getStats);

// Owners CRUD
router.get('/users', getAdminUsers);

router.post('/users', [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
], validate, createAdminUser);

router.put('/users/:id', [
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 8 }),
], validate, updateAdminUser);

router.delete('/users/:id', deleteAdminUser);

router.patch('/users/:id/status', [
  body('status').isIn(['approved', 'suspended']).withMessage('Estado inválido.'),
], validate, toggleAdminStatus);

// Legacy approve/reject
router.patch('/users/:id/approve', approveAdmin);
router.patch('/users/:id/reject', [body('reason').optional().trim()], validate, rejectAdmin);

export default router;
