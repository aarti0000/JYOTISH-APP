const router = require('express').Router();
const { createReview, getAstrologerReviews, checkReviewed } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/',                           protect, createReview);
router.get('/astrologer/:id',              getAstrologerReviews);
router.get('/check/:appointmentId',        protect, checkReviewed);

module.exports = router;