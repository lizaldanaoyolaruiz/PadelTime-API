import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReview, getComplexReviews, canReview, getOwnerReviews, updateReview, deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';

const router = Router();

const reviewRules = [
  body('complexId').notEmpty().withMessage('complexId is required.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be at most 1000 characters.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
];

const updateReviewRules = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be at most 1000 characters.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
];

router.get('/complex/:complexId', getComplexReviews);

router.post('/', protect, requireRole('player'), reviewRules, validate, createReview);
router.get('/can-review/:complexId', protect, requireRole('player'), canReview);
router.patch('/:id', protect, requireRole('player'), updateReviewRules, validate, updateReview);
router.delete('/:id', protect, deleteReview);

router.get('/owner', protect, requireRole('admin'), getOwnerReviews);

export default router;
