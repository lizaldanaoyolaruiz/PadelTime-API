import { Router } from 'express';
import { getBookingsForReport, exportBookings } from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/bookings', protect, requireRole('admin', 'superadmin'), getBookingsForReport);
router.get('/export',   protect, requireRole('admin', 'superadmin'), exportBookings);
router.post('/export',  protect, requireRole('admin', 'superadmin'), exportBookings);

export default router;
