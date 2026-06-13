const express = require('express');
const { body } = require('express-validator');
const {
  createCourt, getCourtsByComplex, updateCourt, deleteCourt, getPublicCourts,
} = require('../controllers/courtController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { uploadSingle } = require('../middlewares/uploadMiddleware');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

const courtRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('type').isIn(['crystal', 'panoramic']).withMessage('Type must be crystal or panoramic.'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number.'),
];

// Public
router.get('/public', getPublicCourts);

// Owner / superadmin
router.post('/', protect, requireRole('admin', 'superadmin'), uploadSingle, courtRules, validate, createCourt);
router.get('/', protect, requireRole('admin', 'superadmin'), getCourtsByComplex);
router.put('/:id', protect, requireRole('admin', 'superadmin'), uploadSingle, courtRules, validate, updateCourt);
router.delete('/:id', protect, requireRole('admin', 'superadmin'), deleteCourt);

module.exports = router;
