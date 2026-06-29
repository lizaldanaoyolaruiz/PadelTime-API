import { body } from 'express-validator';

export const registerRules = [
  body('name').notEmpty().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').optional().isIn(['player', 'admin']).withMessage('Role must be player or admin.'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];
