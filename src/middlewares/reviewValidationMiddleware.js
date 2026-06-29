import { body } from 'express-validator';

export const reviewRules = [
  body('complexId').notEmpty().withMessage('complexId is required.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be at most 1000 characters.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
];

export const updateReviewRules = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be at most 1000 characters.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
];
