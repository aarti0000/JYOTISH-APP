// paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-history', protect, getMyPaymentHistory);

module.exports = router;
