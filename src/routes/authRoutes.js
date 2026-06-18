import { Router } from 'express';
import { body } from 'express-validator';
import { register, verifyEmail, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import resolveRegisterName from '../middlewares/resolveNameMiddleware.js';

const router = Router();

const registerRules = [
  body('name').notEmpty().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').optional().isIn(['player', 'admin']).withMessage('Role must be player or admin.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register', resolveRegisterName, registerRules, validate, register);
router.get('/verify-email', verifyEmail);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);

export default router;
