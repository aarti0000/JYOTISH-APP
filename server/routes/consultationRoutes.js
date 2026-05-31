const router = require('express').Router();
const { startConsultation, getConsultation, getConsultationByAppointment, endConsultation, saveNotes } = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');

router.post('/start/:appointmentId', protect, startConsultation);
router.get('/by-appointment/:appointmentId', protect, getConsultationByAppointment);
router.get('/:id', protect, getConsultation);
router.put('/:id/end', protect, endConsultation);
router.put('/:id/notes', protect, saveNotes);

module.exports = router;