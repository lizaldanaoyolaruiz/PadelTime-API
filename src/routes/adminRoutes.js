const express = require('express');
const { body } = require('express-validator');
const { getAdminUsers, approveAdmin, rejectAdmin } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

router.use(protect, requireRole('superadmin'));

router.get('/users', getAdminUsers);
router.patch('/users/:id/approve', approveAdmin);
router.patch('/users/:id/reject', [
  body('reason').optional().trim(),
], validate, rejectAdmin);

module.exports = router;
