import { Router } from 'express';
import authRoutes from './authRoutes.js';
import complexRoutes from './complexRoutes.js';
import courtRoutes from './courtRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import adminRoutes from './adminRoutes.js';
import chatbotRoutes from './chatbotRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import reportRoutes from './reportRoutes.js';

<<<<<<< HEAD
const authRoutes = require('./authRoutes');
const complexRoutes = require('./complexRoutes');
const courtRoutes = require('./courtRoutes');
const bookingRoutes = require('./bookingRoutes');
const adminRoutes = require('./adminRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const reviewRoutes = require('./reviewRoutes');
const clubRoutes = require('./clubRoutes');
const superAdminGestionRoutes = require('./superAdminGestionRoutes');
const reportRoutes = require('./reportRoutes');
const paymentRoutes = require('./paymentRoutes');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'PadelTime API running' });
});
=======
const router = Router();
>>>>>>> 900dad729b7d2cfd6a908852d27b185064b89f15

router.get('/health', (req, res) => res.json({ status: 'PadelTime API running' }));
router.use('/auth', authRoutes);
router.use('/complexes', complexRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);

export default router;
