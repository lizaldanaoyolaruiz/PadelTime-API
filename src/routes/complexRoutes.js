import { Router } from 'express';
import {
  createComplex, getMyComplex, updateComplex, uploadPhotos, deletePhoto,
  getAdminComplexes, approveComplex, rejectComplex, suspendComplex, getActivityLog,
} from '../controllers/complexController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { soloOwner, soloSuperAdmin } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// Owner routes
router.get('/me',           proteger, soloOwner,      getMyComplex);
router.post('/',            proteger, soloOwner,      createComplex);
router.put('/:id',          proteger, soloOwner,      updateComplex);
router.post('/:id/photos',  proteger, soloOwner,      upload.array('photos', 10), uploadPhotos);
router.delete('/:id/photos',proteger, soloOwner,      deletePhoto);

// Super Admin routes
router.get('/admin',            proteger, soloSuperAdmin, getAdminComplexes);
router.get('/activity',         proteger, soloSuperAdmin, getActivityLog);
router.patch('/:id/approve',    proteger, soloSuperAdmin, approveComplex);
router.patch('/:id/reject',     proteger, soloSuperAdmin, rejectComplex);
router.patch('/:id/suspend',    proteger, soloSuperAdmin, suspendComplex);

export default router;
