const asyncHandler = require('express-async-handler');
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const Astrologer = require('../models/Astrologer');

// @POST /api/consultations/start/:appointmentId
const startConsultation = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.appointmentId);
  if (!appointment || appointment.status !== 'confirmed') {
    res.status(400);
    throw new Error('Appointment must be confirmed before starting consultation');
  }

  const existing = await Consultation.findOne({ appointment: appointment._id });
  if (existing) {
    return res.json({ success: true, consultation: existing });
  }

  const consultation = await Consultation.create({
    appointment: appointment._id,
    user: appointment.user,
    astrologer: appointment.astrologer,
    type: appointment.type,
    status: 'waiting',
    startedAt: new Date(),
  });

  await Appointment.findByIdAndUpdate(appointment._id, {
    status: 'ongoing',
    consultation: consultation._id,
  });

  res.status(201).json({ success: true, consultation });
});

// @PUT /api/consultations/:id/end
const endConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id);
  if (!consultation) {
    res.status(404);
    throw new Error('Consultation not found');
  }

  const endedAt = new Date();
  const duration = Math.round((endedAt - consultation.startedAt) / 60000);

  consultation.status = 'ended';
  consultation.endedAt = endedAt;
  consultation.duration = duration;
  await consultation.save();

  await Appointment.findByIdAndUpdate(consultation.appointment, { status: 'completed' });
  await Astrologer.findByIdAndUpdate(consultation.astrologer, { $inc: { totalConsultations: 1 } });

  res.json({ success: true, consultation });
});

// @GET /api/consultations/:id
const getConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate({ path: 'astrologer', populate: { path: 'user', select: 'name avatar' } })
    .populate('appointment');

  if (!consultation) {
    res.status(404);
    throw new Error('Consultation not found');
  }
  res.json({ success: true, consultation });
});

// @PUT /api/consultations/:id/notes
const saveNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const consultation = await Consultation.findByIdAndUpdate(
    req.params.id,
    { astrologerNotes: notes },
    { new: true }
  );
  res.json({ success: true, consultation });
});

module.exports = { startConsultation, endConsultation, getConsultation, saveNotes };
