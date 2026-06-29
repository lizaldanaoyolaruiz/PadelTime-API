import { Router } from 'express';
import {
  createReview, getComplexReviews, canReview, getOwnerReviews, updateReview, deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { reviewRules, updateReviewRules } from '../middlewares/reviewValidationMiddleware.js';

const router = Router();

router.get('/complex/:complexId', getComplexReviews);

router.post('/', protect, requireRole('player'), reviewRules, validate, createReview);
router.get('/can-review/:complexId', protect, requireRole('player'), canReview);
router.patch('/:id', protect, requireRole('player'), updateReviewRules, validate, updateReview);
router.delete('/:id', protect, deleteReview);

router.get('/owner', protect, requireRole('admin'), getOwnerReviews);

export default router;
