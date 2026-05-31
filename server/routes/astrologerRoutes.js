const router = require('express').Router();
const ctrl = require('../controllers/astrologerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',                   ctrl.getAstrologers);
router.get('/my-profile',         protect, authorize('astrologer'), ctrl.getMyAstrologerProfile);
router.put('/my-profile',         protect, authorize('astrologer'), ctrl.updateAstrologerProfile);
router.put('/working-hours',      protect, authorize('astrologer'), ctrl.updateWorkingHours);
router.post('/block-date',        protect, authorize('astrologer'), ctrl.blockDate);
router.post('/unblock-date',      protect, authorize('astrologer'), ctrl.unblockDate);
router.put('/online-status',      protect, authorize('astrologer'), ctrl.toggleOnlineStatus);
router.get('/:id',                ctrl.getAstrologerById);
router.get('/:id/slots',          ctrl.getAvailableSlots);

module.exports = router;