import { Router } from 'express';
import { register, verifyEmail, login, getMe, updateMe, deleteMe, uploadAvatar } from '../controllers/authController.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import resolveRegisterName from '../middlewares/resolveNameMiddleware.js';
import { registerRules, loginRules } from '../middlewares/authValidationMiddleware.js';

const router = Router();

router.post('/register', resolveRegisterName, registerRules, validate, register);
router.get('/verify-email', verifyEmail);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.delete('/me', protect, deleteMe);
router.post('/me/avatar', protect, uploadSingle, uploadAvatar);

export default router;
