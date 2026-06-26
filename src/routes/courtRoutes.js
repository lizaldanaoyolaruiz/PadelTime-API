import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCourt, getCourtsByComplex, updateCourt, deleteCourt,
  getPublicCourts, getPublicCourtById, getCourtsSchedule, updateCourtSchedule,
  uploadCourtPhotos, deleteCourtPhoto, setCourtPrincipalPhoto,
} from '../controllers/courtController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { uploadSingle, uploadMultiple } from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';

const router = Router();

const courtRules = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres.'),
  body('type').isIn(['crystal', 'panoramic']).withMessage('El tipo debe ser crystal o panoramic.'),
  body('pricePerHour').optional().isFloat({ min: 0, max: 999999 }).withMessage('El precio máximo es $999.999.'),
  body('description').trim().notEmpty().withMessage('La descripción es requerida.')
    .isLength({ min: 3, max: 300 }).withMessage('La descripción debe tener entre 3 y 300 caracteres.'),
];

const courtUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres.'),
  body('type').optional().isIn(['crystal', 'panoramic']).withMessage('El tipo debe ser crystal o panoramic.'),
  body('pricePerHour').optional().isFloat({ min: 0.01, max: 999999 }).withMessage('El precio debe ser mayor a 0 y máximo $999.999.'),
  body('description').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía.')
    .isLength({ min: 3, max: 300 }).withMessage('La descripción debe tener entre 3 y 300 caracteres.'),
];

router.get('/public', getPublicCourts);
router.get('/public/:id', getPublicCourtById);

router.post('/', protect, requireRole('admin', 'superadmin'), uploadSingle, courtRules, validate, createCourt);
router.get('/', protect, requireRole('admin', 'superadmin'), getCourtsByComplex);
router.put('/:id', protect, requireRole('admin', 'superadmin'), uploadSingle, courtUpdateRules, validate, updateCourt);
router.delete('/:id', protect, requireRole('admin', 'superadmin'), deleteCourt);
router.post('/:id/photos', protect, requireRole('admin', 'superadmin'), uploadMultiple, uploadCourtPhotos);
router.delete('/:id/photos', protect, requireRole('admin', 'superadmin'), deleteCourtPhoto);
router.patch('/:id/photos/principal', protect, requireRole('admin', 'superadmin'), setCourtPrincipalPhoto);
router.get('/schedule', protect, requireRole('admin', 'superadmin'), getCourtsSchedule);
router.put('/:courtId/schedule', protect, requireRole('admin', 'superadmin'), updateCourtSchedule);

export default router;
