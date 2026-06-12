import { Router } from 'express';
import {
  createCourt, getCourtsByComplex, updateCourt, deleteCourt, getPublicCourts,
} from '../controllers/courtController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { soloOwner } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// Public — no auth required
router.get('/public', getPublicCourts);

// Owner routes
router.use(proteger, soloOwner);
router.post('/',     upload.single('photo'), createCourt);
router.get('/',      getCourtsByComplex);
router.put('/:id',   upload.single('photo'), updateCourt);
router.delete('/:id', deleteCourt);

export default router;
