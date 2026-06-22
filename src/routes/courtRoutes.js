import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCourt, getCourtsByComplex, updateCourt, deleteCourt,
  getPublicCourts, getPublicCourtById, getCourtsSchedule, updateCourtSchedule
} from '../controllers/courtController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';

const router = Router();

const courtRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('type').isIn(['crystal', 'panoramic']).withMessage('Type must be crystal or panoramic.'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number.'),
];

router.get('/public', getPublicCourts);
router.get('/public/:id', getPublicCourtById);

router.post('/', protect, requireRole('admin', 'superadmin'), uploadSingle, courtRules, validate, createCourt);
router.get('/', protect, requireRole('admin', 'superadmin'), getCourtsByComplex);
router.put('/:id', protect, requireRole('admin', 'superadmin'), uploadSingle, courtRules, validate, updateCourt);
router.delete('/:id', protect, requireRole('admin', 'superadmin'), deleteCourt);
router.get('/schedule', protect, requireRole('admin', 'superadmin'), getCourtsSchedule);
router.put('/:courtId/schedule', protect, requireRole('admin', 'superadmin'), updateCourtSchedule);

export default router;
