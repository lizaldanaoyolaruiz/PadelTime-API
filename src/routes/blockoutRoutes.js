import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import {
  getBlockouts,
  createBlockout,
  updateBlockout,
  deleteBlockout,
} from '../controllers/blockoutController.js';

const router = Router();

router.get('/',     protect, requireRole('admin', 'superadmin'), getBlockouts);
router.post('/',    protect, requireRole('admin', 'superadmin'), createBlockout);
router.put('/:id',  protect, requireRole('admin', 'superadmin'), updateBlockout);
router.delete('/:id', protect, requireRole('admin', 'superadmin'), deleteBlockout);

export default router;
