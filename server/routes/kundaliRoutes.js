const express = require('express');
const router = express.Router();
const { generateChart, getMyKundalis, getKundaliById } = require('../controllers/kundaliController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateChart);
router.get('/my-charts', protect, getMyKundalis);
router.get('/:id', protect, getKundaliById);

module.exports = router;
