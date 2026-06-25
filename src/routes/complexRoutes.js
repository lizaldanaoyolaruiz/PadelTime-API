import { Router } from 'express';
import { body } from 'express-validator';
import {
  getFeaturedComplexes,
  getPublicComplexes, getPublicComplexById,
  createComplex, createComplexByAdmin, getMyComplex, updateComplex,
  uploadPhotos, deletePhoto, setPrincipalPhoto,
  getAdminComplexes, approveComplex, rejectComplex, suspendComplex, deleteComplex,
  toggleFeatured, getMyComplexes,
} from '../controllers/complexController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { uploadMultiple } from '../middlewares/uploadMiddleware.js';
import { getConfig, updateConfig } from '../controllers/complexController.js';
import validate from '../middlewares/validateMiddleware.js';

const router = Router();

const CITIES = ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo'];

const complexRules = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
  body('city').trim().notEmpty().withMessage('La ciudad es requerida.')
    .isIn(CITIES).withMessage('Ciudad inválida. Opciones: ' + CITIES.join(', ')),
  body('price').isFloat({ min: 0.01, max: 999999 }).withMessage('El precio debe ser mayor a 0 y máximo $999.999.'),
  body('openTime').notEmpty().withMessage('El horario de apertura es requerido.')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('openTime debe ser HH:MM.'),
  body('closeTime').notEmpty().withMessage('El horario de cierre es requerido.')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('closeTime debe ser HH:MM.'),
  body('whatsapp').trim().notEmpty().withMessage('El WhatsApp es requerido.')
    .matches(/^\+?[\d\s\-]{7,15}$/).withMessage('Teléfono inválido (7–15 dígitos).'),
  body('description').trim().notEmpty().withMessage('La descripción es requerida.')
    .isLength({ min: 3, max: 500 }).withMessage('La descripción debe tener entre 3 y 500 caracteres.'),
  body('depositPercentage').notEmpty().withMessage('El porcentaje de seña es requerido.')
    .isInt({ min: 0, max: 100 }).withMessage('La seña debe ser un entero entre 0 y 100.'),
];

const complexUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
  body('city').optional().trim().isIn(CITIES).withMessage('Ciudad inválida.'),
  body('price').optional().isFloat({ min: 0.01, max: 999999 }).withMessage('El precio debe ser mayor a 0 y máximo $999.999.'),
  body('openTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('openTime debe ser HH:MM.'),
  body('closeTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('closeTime debe ser HH:MM.'),
  body('whatsapp').optional().trim().notEmpty().withMessage('El WhatsApp no puede estar vacío.')
    .matches(/^\+?[\d\s\-]{7,15}$/).withMessage('Teléfono inválido (7–15 dígitos).'),
  body('description').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía.')
    .isLength({ min: 3, max: 500 }).withMessage('La descripción debe tener entre 3 y 500 caracteres.'),
  body('depositPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('La seña debe ser un entero entre 0 y 100.'),
];

router.get('/', getFeaturedComplexes);
router.get('/public', getPublicComplexes);
router.get('/public/:id', getPublicComplexById);

router.post('/', protect, requireRole('admin'), complexRules, validate, createComplex);
router.get('/me', protect, requireRole('admin'), getMyComplex);
router.get('/me/all', protect, requireRole('admin'), getMyComplexes);
router.put('/:id', protect, requireRole('admin', 'superadmin'), complexUpdateRules, validate, updateComplex);
router.post('/:id/photos', protect, requireRole('admin', 'superadmin'), uploadMultiple, uploadPhotos);
router.delete('/:id/photos', protect, requireRole('admin', 'superadmin'), deletePhoto);
router.patch('/:id/photos/principal', protect, requireRole('admin', 'superadmin'), setPrincipalPhoto);

const complexAdminCreateRules = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 3, max: 100 }).withMessage('Nombre: 3–100 caracteres.'),
  body('ownerEmail').trim().notEmpty().isEmail().withMessage('Email válido del propietario requerido.'),
  body('city').trim().notEmpty().isIn(CITIES).withMessage('Ciudad inválida.'),
  body('address').optional().trim().isLength({ min: 5, max: 120 }).withMessage('Dirección: 5–120 caracteres.'),
  body('observations').optional().trim().isLength({ max: 300 }).withMessage('Observaciones: máx. 300 caracteres.'),
];

router.get('/admin', protect, requireRole('superadmin'), getAdminComplexes);
router.post('/admin', protect, requireRole('superadmin'), complexAdminCreateRules, validate, createComplexByAdmin);
router.delete('/:id', protect, requireRole('superadmin'), deleteComplex);
router.patch('/:id/featured', protect, requireRole('superadmin'), toggleFeatured);
router.patch('/:id/approve', protect, requireRole('superadmin'), approveComplex);
router.patch('/:id/reject', protect, requireRole('superadmin'), [body('reason').optional().trim()], validate, rejectComplex);
router.patch('/:id/suspend', protect, requireRole('superadmin'), [body('reason').optional().trim()], validate, suspendComplex);
router.get('/:complexId/config', protect, requireRole('admin', 'superadmin'), getConfig);
router.put('/:complexId/config', protect, requireRole('admin', 'superadmin'), updateConfig);

export default router;
