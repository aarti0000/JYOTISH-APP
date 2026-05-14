// ── astrologerRoutes.js ──────────────────────────────────────────
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/astrologerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', ctrl.getAstrologers);
router.get('/my-profile', protect, authorize('astrologer'), ctrl.getMyAstrologerProfile);
router.put('/my-profile', protect, authorize('astrologer'), ctrl.updateAstrologerProfile);
router.post('/slots', protect, authorize('astrologer'), ctrl.addSlots);
router.put('/online-status', protect, authorize('astrologer'), ctrl.toggleOnlineStatus);
router.get('/:id', ctrl.getAstrologerById);
router.get('/:id/slots', ctrl.getAvailableSlots);

module.exports = router;
