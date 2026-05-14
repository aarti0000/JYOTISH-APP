const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Astrologer = require('../models/Astrologer');
const { sendEmail } = require('../services/emailService');

// @POST /api/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const { astrologerId, date, startTime, endTime, duration, type, userBirthDetails, question, amount } = req.body;

  const astrologer = await Astrologer.findById(astrologerId).populate('user', 'name email');
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }

  // Check slot availability
  const slotIndex = astrologer.availableSlots.findIndex(
    s => s.date === date && s.startTime === startTime && !s.isBooked
  );
  if (slotIndex === -1) {
    res.status(400);
    throw new Error('This slot is no longer available');
  }

  const appointment = await Appointment.create({
    user: req.user._id,
    astrologer: astrologerId,
    date, startTime, endTime, duration, type,
    userBirthDetails, question,
    amount: amount || astrologer.pricePerMinute * duration,
    status: 'pending',
  });

  // Send confirmation email
  await sendEmail({
    to: req.user.email,
    subject: 'Appointment Booked — Jyotish App',
    html: `<h2>Your appointment is booked!</h2>
           <p>Astrologer: <strong>${astrologer.user.name}</strong></p>
           <p>Date: <strong>${date}</strong> at <strong>${startTime}</strong></p>
           <p>Type: <strong>${type}</strong> | Duration: <strong>${duration} mins</strong></p>`,
  }).catch(() => {}); // don't fail if email fails

  res.status(201).json({ success: true, appointment });
});

// @GET /api/appointments  — user's own appointments
const getMyAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .populate({ path: 'astrologer', populate: { path: 'user', select: 'name avatar' } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, appointments });
});

// @GET /api/appointments/astrologer  — astrologer's appointments
const getAstrologerAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const astrologer = await Astrologer.findOne({ user: req.user._id });
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer profile not found');
  }

  const filter = { astrologer: astrologer._id };
  if (status) filter.status = status;
  if (date) filter.date = date;

  const appointments = await Appointment.find(filter)
    .populate('user', 'name avatar email phone')
    .sort({ date: 1, startTime: 1 });

  res.json({ success: true, appointments });
});

// @GET /api/appointments/:id
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('user', 'name avatar email phone')
    .populate({ path: 'astrologer', populate: { path: 'user', select: 'name avatar email' } })
    .populate('consultation');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Only user or astrologer can view
  const astrologer = await Astrologer.findOne({ user: req.user._id });
  const isOwner = appointment.user._id.toString() === req.user._id.toString();
  const isAstrologer = astrologer && appointment.astrologer._id.toString() === astrologer._id.toString();

  if (!isOwner && !isAstrologer && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, appointment });
});

// @PUT /api/appointments/:id/status
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  appointment.status = status;
  if (cancelReason) appointment.cancelReason = cancelReason;
  await appointment.save();

  res.json({ success: true, appointment });
});

// @PUT /api/appointments/:id/cancel
const cancelAppointment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  if (appointment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this appointment');
  }
  if (['completed', 'cancelled'].includes(appointment.status)) {
    res.status(400);
    throw new Error('Cannot cancel this appointment');
  }

  appointment.status = 'cancelled';
  appointment.cancelReason = reason;
  await appointment.save();

  res.json({ success: true, message: 'Appointment cancelled', appointment });
});

module.exports = {
  createAppointment, getMyAppointments, getAstrologerAppointments,
  getAppointmentById, updateAppointmentStatus, cancelAppointment,
};
