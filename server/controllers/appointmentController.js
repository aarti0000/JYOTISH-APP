const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Astrologer = require('../models/Astrologer');
const { sendEmail } = require('../services/emailService');

const createAppointment = asyncHandler(async (req, res) => {
  const {
    astrologerId, date, startTime, endTime,
    duration, type, userBirthDetails, question, amount
  } = req.body;

  const astrologer = await Astrologer.findById(astrologerId)
    .populate('user', 'name email');
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }

  // Check if astrologer is available on this date
  if (astrologer.blockedDates && astrologer.blockedDates.includes(date)) {
    res.status(400);
    throw new Error('Astrologer is not available on this date');
  }

  // Check if slot is already booked
  const existingAppointment = await Appointment.findOne({
    astrologer: astrologerId,
    date,
    startTime,
    status: { $in: ['pending', 'confirmed', 'ongoing'] },
  });
  if (existingAppointment) {
    res.status(400);
    throw new Error('This time slot is already booked. Please choose another slot.');
  }

  // Calculate amount if not provided
  const slotDuration = duration || astrologer.workingHours?.slotDuration || 60;
  const totalAmount  = amount || astrologer.pricePerMinute * slotDuration;

  const appointment = await Appointment.create({
    user:             req.user._id,
    astrologer:       astrologerId,
    date,
    startTime,
    endTime,
    duration:         slotDuration,
    type,
    userBirthDetails,
    question,
    amount:           totalAmount,
    status:           'pending',
    paymentStatus:    'unpaid',
  });

  // Send confirmation email (won't crash if email not configured)
  await sendEmail({
    to:      req.user.email,
    subject: 'Appointment Booked - JyotishApp Nepal',
    html: `
      <h2>Your appointment has been booked!</h2>
      <p>Astrologer: <strong>${astrologer.user.name}</strong></p>
      <p>Date: <strong>${date}</strong> at <strong>${startTime}</strong></p>
      <p>Type: <strong>${type}</strong></p>
      <p>Duration: <strong>${slotDuration} minutes</strong></p>
      <p>Amount: <strong>Rs. ${totalAmount}</strong></p>
      <p>Please complete your payment to confirm the appointment.</p>
    `,
  }).catch(() => {});

  res.status(201).json({ success: true, appointment });
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .populate({
      path: 'astrologer',
      populate: { path: 'user', select: 'name avatar' },
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, appointments });
});

const getAstrologerAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const astrologer = await Astrologer.findOne({ user: req.user._id });
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer profile not found');
  }

  const filter = { astrologer: astrologer._id };
  if (status) filter.status = status;
  if (date)   filter.date   = date;

  const appointments = await Appointment.find(filter)
    .populate('user', 'name avatar email phone')
    .sort({ date: 1, startTime: 1 });

  res.json({ success: true, appointments });
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('user', 'name avatar email phone')
    .populate({
      path: 'astrologer',
      populate: { path: 'user', select: 'name avatar email' },
    })
    .populate('consultation');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  res.json({ success: true, appointment });
});

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

  appointment.status       = 'cancelled';
  appointment.cancelReason = reason;
  await appointment.save();

  res.json({ success: true, appointment });
});

module.exports = {
  createAppointment,
  getMyAppointments,
  getAstrologerAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};