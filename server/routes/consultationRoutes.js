const express = require('express');
const router = express.Router();
const { startConsultation, endConsultation, getConsultation, saveNotes } = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');

router.post('/start/:appointmentId', protect, startConsultation);
router.put('/:id/end', protect, endConsultation);
router.get('/:id', protect, getConsultation);
router.put('/:id/notes', protect, saveNotes);

module.exports = router;
