const asyncHandler = require('express-async-handler');
const Consultation = require('../models/Consultation');
const Appointment  = require('../models/Appointment');
const Astrologer   = require('../models/Astrologer');

const startConsultation = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.appointmentId);
  if (!appointment) { res.status(404); throw new Error('Appointment not found'); }
  if (!['confirmed','ongoing'].includes(appointment.status)) {
    res.status(400);
    throw new Error('Appointment must be confirmed. Status: ' + appointment.status);
  }

  const existing = await Consultation.findOne({ appointment: appointment._id })
    .populate('user','name avatar')
    .populate({ path:'astrologer', populate:{ path:'user', select:'name avatar' } })
    .populate('appointment');
  if (existing) return res.json({ success:true, consultation:existing });

  const consultation = await Consultation.create({
    appointment: appointment._id,
    user:        appointment.user,
    astrologer:  appointment.astrologer,
    type:        appointment.type,
    status:      'waiting',
    startedAt:   new Date(),
  });
  await Appointment.findByIdAndUpdate(appointment._id, {
    status:'ongoing', consultation:consultation._id,
  });

  const populated = await Consultation.findById(consultation._id)
    .populate('user','name avatar')
    .populate({ path:'astrologer', populate:{ path:'user', select:'name avatar' } })
    .populate('appointment');
  res.status(201).json({ success:true, consultation:populated });
});

const getConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate('user','name avatar')
    .populate({ path:'astrologer', populate:{ path:'user', select:'name avatar' } })
    .populate('appointment');
  if (!consultation) { res.status(404); throw new Error('Consultation not found'); }
  res.json({ success:true, consultation });
});

const getConsultationByAppointment = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findOne({ appointment:req.params.appointmentId })
    .populate('user','name avatar')
    .populate({ path:'astrologer', populate:{ path:'user', select:'name avatar' } })
    .populate('appointment');
  if (!consultation) { res.status(404); throw new Error('Not found'); }
  res.json({ success:true, consultation });
});

const endConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate('user','name avatar')
    .populate({ path:'astrologer', populate:{ path:'user', select:'name avatar' } })
    .populate('appointment');
  if (!consultation) { res.status(404); throw new Error('Not found'); }

  const endedAt  = new Date();
  const duration = Math.round((endedAt - consultation.startedAt) / 60000);

  consultation.status   = 'ended';
  consultation.endedAt  = endedAt;
  consultation.duration = duration;
  await consultation.save();

  // Mark appointment as completed
  await Appointment.findByIdAndUpdate(consultation.appointment._id || consultation.appointment, {
    status: 'completed',
  });

  // Increment astrologer's total consultations
  await Astrologer.findByIdAndUpdate(consultation.astrologer._id || consultation.astrologer, {
    $inc: { totalConsultations: 1 },
  });

  res.json({ success:true, consultation });
});

const saveNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const consultation = await Consultation.findByIdAndUpdate(
    req.params.id, { astrologerNotes:notes }, { new:true }
  );
  res.json({ success:true, consultation });
});

module.exports = {
  startConsultation, getConsultation, getConsultationByAppointment,
  endConsultation, saveNotes,
};