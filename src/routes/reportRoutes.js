import { Router } from 'express';
import { exportBookings } from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/export', protect, requireRole('admin'), exportBookings);
router.post('/export', protect, requireRole('admin'), exportBookings);

export default router;
