import { Router } from 'express';
import {
  getSlots,
  getBookings,
  createBooking,
  confirmarReserva,
  rechazarReserva,
  cancelarReserva,
} from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/slots', getSlots);

router.get('/', protect, getBookings);
router.post('/', protect, createBooking);

router.patch('/:id/confirm', protect, requireRole('admin', 'superadmin'), confirmarReserva);
router.patch('/:id/reject', protect, requireRole('admin', 'superadmin'), rechazarReserva);
router.patch('/:id/cancel', protect, cancelarReserva);

export default router;
