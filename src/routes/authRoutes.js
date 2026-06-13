const express = require('express');
const { body } = require('express-validator');
const { register, verifyEmail, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

const registerRules = [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Name must be 3–50 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').optional().isIn(['player', 'admin']).withMessage('Role must be player or admin.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register', registerRules, validate, register);
router.get('/verify-email', verifyEmail);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);

module.exports = router;
