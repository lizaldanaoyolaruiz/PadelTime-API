import { Router } from 'express';
import { body } from 'express-validator';
import { getAdminUsers, approveAdmin, rejectAdmin } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';

const router = Router();

router.use(protect, requireRole('superadmin'));

router.get('/users', getAdminUsers);
router.patch('/users/:id/approve', approveAdmin);
router.patch('/users/:id/reject', [body('reason').optional().trim()], validate, rejectAdmin);

export default router;
