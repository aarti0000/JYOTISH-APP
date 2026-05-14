const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment } = require('../models/index');
const Appointment = require('../models/Appointment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/payments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  if (appointment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const options = {
    amount: appointment.amount * 100,   // paise
    currency: 'INR',
    receipt: `receipt_${appointmentId}`,
    notes: { appointmentId: appointmentId.toString(), userId: req.user._id.toString() },
  };

  const order = await razorpay.orders.create(options);

  const payment = await Payment.create({
    user: req.user._id,
    appointment: appointmentId,
    razorpayOrderId: order.id,
    amount: appointment.amount,
  });

  res.json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    paymentId: payment._id,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  // Update payment record
  await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' }
  );

  // Confirm appointment
  await Appointment.findByIdAndUpdate(appointmentId, {
    paymentStatus: 'paid',
    paymentId: razorpay_payment_id,
    status: 'confirmed',
  });

  res.json({ success: true, message: 'Payment verified and appointment confirmed' });
});

// @GET /api/payments/my-history
const getMyPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('appointment', 'date startTime type status')
    .sort({ createdAt: -1 });
  res.json({ success: true, payments });
});

module.exports = { createOrder, verifyPayment, getMyPaymentHistory };
