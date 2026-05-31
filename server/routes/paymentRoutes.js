// paymentRoutes.js
const express = require('express');
const router = express.Router();
const { initiatePayment, verifyEsewaPayment, freeConfirm, getMyPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/initiate',     protect, initiatePayment);
router.post('/verify-esewa', protect, verifyEsewaPayment);
router.post('/free-confirm', protect, freeConfirm);
router.get('/my-history',    protect, getMyPaymentHistory);

module.exports = router;