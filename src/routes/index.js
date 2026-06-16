const express = require('express');

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

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'PadelTime API running' });
});

router.use('/auth', authRoutes);
router.use('/complexes', complexRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/clubs', clubRoutes);
router.use('/superadmin', superAdminGestionRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
