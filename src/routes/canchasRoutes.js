import { Router } from 'express';
import {
  crearCancha,
  getCanchasPorComplejo,
  actualizarCancha,
  eliminarCancha,
  getCanchasPublicas,
} from '../controllers/canchasController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { soloOwner } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// Ruta pública — no requiere token
router.get('/publicas', getCanchasPublicas);

// Rutas privadas — requieren token y rol owner
router.use(proteger, soloOwner);

router.post('/', upload.single('foto'), crearCancha);
router.get('/', getCanchasPorComplejo);
router.put('/:id', upload.single('foto'), actualizarCancha);
router.delete('/:id', eliminarCancha);

export default router;
