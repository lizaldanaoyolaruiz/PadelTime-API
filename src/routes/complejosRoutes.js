import { Router } from 'express';
import {
  crearComplejo,
  getMiComplejo,
  actualizarComplejo,
  subirFotos,
  eliminarFoto,
  getAdminComplejos,
  aprobarComplejo,
  rechazarComplejo,
  suspenderComplejo,
  getActivityLog,
} from '../controllers/complejosController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { soloOwner, soloSuperAdmin } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// Rutas static antes de /:id para evitar conflictos de matching

// Owner
router.get('/me', proteger, soloOwner, getMiComplejo);
router.post('/', proteger, soloOwner, crearComplejo);
router.put('/:id', proteger, soloOwner, actualizarComplejo);
router.post('/:id/fotos', proteger, soloOwner, upload.array('fotos', 10), subirFotos);
router.delete('/:id/fotos', proteger, soloOwner, eliminarFoto);

// Super Admin
router.get('/admin', proteger, soloSuperAdmin, getAdminComplejos);
router.get('/activity', proteger, soloSuperAdmin, getActivityLog);
router.patch('/:id/approve', proteger, soloSuperAdmin, aprobarComplejo);
router.patch('/:id/reject', proteger, soloSuperAdmin, rechazarComplejo);
router.patch('/:id/suspend', proteger, soloSuperAdmin, suspenderComplejo);

export default router;
