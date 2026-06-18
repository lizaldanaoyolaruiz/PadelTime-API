const express = require('express');
const { handleWebhook } = require('../controllers/paymentController');

const router = express.Router();

// No auth — Mercado Pago POSTs here from their servers
router.post('/webhook/:bookingId', handleWebhook);

module.exports = router;
