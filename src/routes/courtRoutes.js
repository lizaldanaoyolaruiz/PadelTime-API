import { Router } from 'express';
import {
  createCourt, getCourtsByComplex, updateCourt, deleteCourt,
  getPublicCourts, getPublicCourtById, getCourtsSchedule, updateCourtSchedule,
  uploadCourtPhotos, deleteCourtPhoto, setCourtPrincipalPhoto,
} from '../controllers/courtController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { uploadSingle, uploadMultiple } from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { courtRules, courtUpdateRules } from '../middlewares/courtValidationMiddleware.js';

const router = Router();

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
