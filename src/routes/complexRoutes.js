import { Router } from 'express';
import { body } from 'express-validator';
import {
  getFeaturedComplexes,
  getPublicComplexes, getPublicComplexById,
  createComplex, getMyComplex, updateComplex,
  uploadPhotos, deletePhoto,
  getAdminComplexes, approveComplex, rejectComplex, suspendComplex, deleteComplex,
  toggleFeatured,
} from '../controllers/complexController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { uploadMultiple } from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';

const router = Router();

const complexRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('location').trim().notEmpty().withMessage('Location is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('openTime').matches(/^\d{2}:\d{2}$/).withMessage('openTime must be HH:MM.'),
  body('closeTime').matches(/^\d{2}:\d{2}$/).withMessage('closeTime must be HH:MM.'),
  body('depositPercentage').optional().isIn([20, 30, 50]).withMessage('Deposit must be 20, 30, or 50.'),
];

const complexUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('location').optional().trim(),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty.'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('openTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('openTime must be HH:MM.'),
  body('closeTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('closeTime must be HH:MM.'),
  body('depositPercentage').optional().isIn([20, 30, 50]).withMessage('Deposit must be 20, 30, or 50.'),
];

router.get('/', getFeaturedComplexes);
router.get('/public', getPublicComplexes);
router.get('/public/:id', getPublicComplexById);

router.post('/', protect, requireRole('admin'), complexRules, validate, createComplex);
router.get('/me', protect, requireRole('admin'), getMyComplex);
router.put('/:id', protect, requireRole('admin', 'superadmin'), complexUpdateRules, validate, updateComplex);
router.post('/:id/photos', protect, requireRole('admin', 'superadmin'), uploadMultiple, uploadPhotos);
router.delete('/:id/photos', protect, requireRole('admin', 'superadmin'), deletePhoto);

router.get('/admin', protect, requireRole('superadmin'), getAdminComplexes);
router.delete('/:id', protect, requireRole('superadmin'), deleteComplex);
router.patch('/:id/featured', protect, requireRole('superadmin'), toggleFeatured);
router.patch('/:id/approve', protect, requireRole('superadmin'), approveComplex);
router.patch('/:id/reject', protect, requireRole('superadmin'), [body('reason').optional().trim()], validate, rejectComplex);
router.patch('/:id/suspend', protect, requireRole('superadmin'), [body('reason').optional().trim()], validate, suspendComplex);

export default router;
