const express = require('express');
const { createBooking, getBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', protect, requireRole('player'), createBooking);
router.get('/', protect, getBookings);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
