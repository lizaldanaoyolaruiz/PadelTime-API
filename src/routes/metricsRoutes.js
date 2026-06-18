import { Router } from 'express';
import { getMetrics } from '../controllers/metricsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', protect, requireRole('admin', 'superadmin'), getMetrics);

export default router;
