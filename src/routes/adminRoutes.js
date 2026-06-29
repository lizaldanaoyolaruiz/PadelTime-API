import { Router } from 'express';
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
import {
  createAdminUserRules, updateAdminUserRules, toggleAdminStatusRules, adminReasonRules,
} from '../middlewares/adminValidationMiddleware.js';

const router = Router();

router.use(protect, requireRole('superadmin'));

router.get('/stats', getStats);

router.get('/users', getAdminUsers);
router.post('/users', createAdminUserRules, validate, createAdminUser);
router.put('/users/:id', updateAdminUserRules, validate, updateAdminUser);
router.delete('/users/:id', deleteAdminUser);
router.patch('/users/:id/status', toggleAdminStatusRules, validate, toggleAdminStatus);

router.patch('/users/:id/approve', approveAdmin);
router.patch('/users/:id/reject', adminReasonRules, validate, rejectAdmin);

export default router;
