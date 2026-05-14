const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, ctrl.createAppointment);
router.get('/', protect, ctrl.getMyAppointments);
router.get('/astrologer', protect, authorize('astrologer'), ctrl.getAstrologerAppointments);
router.get('/:id', protect, ctrl.getAppointmentById);
router.put('/:id/status', protect, ctrl.updateAppointmentStatus);
router.put('/:id/cancel', protect, ctrl.cancelAppointment);

module.exports = router;
