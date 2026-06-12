import { Router } from 'express';
import { createBooking, getBookings, cancelBooking } from '../controllers/bookingController.js';
import { proteger } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(proteger);

router.post('/',      createBooking);
router.get('/',       getBookings);
router.delete('/:id', cancelBooking);

export default router;
