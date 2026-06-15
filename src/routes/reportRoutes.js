const express = require('express');
const { exportBookings } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/export', protect, requireRole('admin'), exportBookings);
router.post('/export', protect, requireRole('admin'), exportBookings);

module.exports = router;
