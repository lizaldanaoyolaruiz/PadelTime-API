import { Router } from 'express';
import authRoutes from './authRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import complexRoutes from './complexRoutes.js';
import courtRoutes from './courtRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import adminRoutes from './adminRoutes.js';
import chatbotRoutes from './chatbotRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import reportRoutes from './reportRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import metricsRoutes from './metricsRoutes.js';
import contactRoutes from './contactRoutes.js';
import blockoutRoutes from './blockoutRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'PadelTime API running' }));
router.use('/auth', authRoutes);
router.use('/complexes', complexRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/reviews', reviewRoutes);
//router.use('/reports', reportRoutes);
router.use("/metrics", metricsRoutes);
router.use('/payments', paymentRoutes);
router.use('/contact', contactRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/blockouts', blockoutRoutes);

export default router;