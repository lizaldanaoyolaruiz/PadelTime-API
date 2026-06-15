const express = require('express');
const { body } = require('express-validator');
const {
  createReview, getComplexReviews, canReview, getOwnerReviews, updateReview, deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

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

// Public
router.get('/complex/:complexId', getComplexReviews);

// Player
router.post('/', protect, requireRole('player'), reviewRules, validate, createReview);
router.get('/can-review/:complexId', protect, requireRole('player'), canReview);
router.patch('/:id', protect, requireRole('player'), updateReviewRules, validate, updateReview);
router.delete('/:id', protect, deleteReview);

// Owner
router.get('/owner', protect, requireRole('admin'), getOwnerReviews);

module.exports = router;
