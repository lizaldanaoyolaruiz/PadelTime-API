import { Router } from 'express';
import {
  crearComplejo,
  getMiComplejo,
  actualizarComplejo,
  subirFotos,
  eliminarFoto,
} from '../controllers/complejosController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { soloOwner } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(proteger, soloOwner);

router.post('/', crearComplejo);
router.get('/me', getMiComplejo);
router.put('/:id', actualizarComplejo);
router.post('/:id/fotos', upload.array('fotos', 10), subirFotos);
router.delete('/:id/fotos', eliminarFoto);

export default router;
