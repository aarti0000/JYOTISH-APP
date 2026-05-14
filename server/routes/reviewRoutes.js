const express = require('express');
const router = express.Router();
const { createReview, getAstrologerReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/astrologer/:id', getAstrologerReviews);

module.exports = router;
