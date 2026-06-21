import { Router } from 'express';
import {
  getFavoritos,
  checkFavorito,
  agregarFavorito,
  quitarFavorito,
} from '../controllers/favoriteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/',                        protect, getFavoritos);
router.get('/:complexId/check',        protect, checkFavorito);
router.post('/:complexId',             protect, agregarFavorito);
router.delete('/:complexId',           protect, quitarFavorito);

export default router;
