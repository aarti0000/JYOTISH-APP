const express = require('express');
const router = express.Router();
const { calculateMarriageCompatibility } = require('../controllers/Matchingservice');
const { protect } = require('../middleware/auth');

router.post('/calculate', protect, (req, res, next) => {
  try {
    const { boy, girl } = req.body;
    if (!boy || !girl) {
      return res.status(400).json({ success: false, message: 'Boy and Girl details are required' });
    }
    const result = calculateMarriageCompatibility(boy, girl);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
