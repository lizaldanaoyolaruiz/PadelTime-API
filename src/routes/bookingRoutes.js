import { Router } from 'express';
import { createBooking, getBookings, cancelBooking } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.post('/', protect, requireRole('player'), createBooking);
router.get('/', protect, getBookings);
router.patch('/:id/cancel', protect, cancelBooking);

export default router;
