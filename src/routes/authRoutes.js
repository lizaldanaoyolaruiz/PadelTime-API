import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { proteger } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', proteger, getMe);

export default router;
