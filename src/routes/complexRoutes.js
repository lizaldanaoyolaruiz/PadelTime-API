const express = require('express');
const { body } = require('express-validator');
const {
  createComplex, getMyComplex, updateComplex,
  uploadPhotos, deletePhoto,
  getAdminComplexes, approveComplex, rejectComplex, suspendComplex,
} = require('../controllers/complexController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { uploadMultiple } = require('../middlewares/uploadMiddleware');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

const complexRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('location').trim().notEmpty().withMessage('Location is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('openTime').matches(/^\d{2}:\d{2}$/).withMessage('openTime must be HH:MM.'),
  body('closeTime').matches(/^\d{2}:\d{2}$/).withMessage('closeTime must be HH:MM.'),
  body('depositPercentage').optional().isIn([20, 30, 50]).withMessage('Deposit must be 20, 30, or 50.'),
];

// Admin (owner) routes
router.post('/', protect, requireRole('admin'), complexRules, validate, createComplex);
router.get('/me', protect, requireRole('admin'), getMyComplex);
router.put('/:id', protect, requireRole('admin', 'superadmin'), complexRules, validate, updateComplex);
router.post('/:id/photos', protect, requireRole('admin', 'superadmin'), uploadMultiple, uploadPhotos);
router.delete('/:id/photos', protect, requireRole('admin', 'superadmin'), deletePhoto);

// Superadmin routes
router.get('/admin', protect, requireRole('superadmin'), getAdminComplexes);
router.patch('/:id/approve', protect, requireRole('superadmin'), approveComplex);
router.patch('/:id/reject', protect, requireRole('superadmin'), [
  body('reason').trim().notEmpty().withMessage('Rejection reason is required.'),
], validate, rejectComplex);
router.patch('/:id/suspend', protect, requireRole('superadmin'), [
  body('reason').trim().notEmpty().withMessage('Suspension reason is required.'),
], validate, suspendComplex);

module.exports = router;
