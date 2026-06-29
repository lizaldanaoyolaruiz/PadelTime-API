import { Router } from 'express';
import { getMantenimientos, crearMantenimiento, eliminarMantenimiento } from '../controllers/maintenanceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', protect, requireRole('admin', 'superadmin'), getMantenimientos);
router.post('/', protect, requireRole('admin', 'superadmin'), crearMantenimiento);
router.delete('/:id', protect, requireRole('admin', 'superadmin'), eliminarMantenimiento);

export default router;
