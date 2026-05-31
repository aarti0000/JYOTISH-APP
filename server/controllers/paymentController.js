const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const { Payment } = require('../models/index');

const ESEWA_CONFIG = {
  merchantId:  process.env.ESEWA_MERCHANT_ID  || 'EPAYTEST',
  secretKey:   process.env.ESEWA_SECRET_KEY   || '8gBm/:&EnhH.1/q',
  gatewayUrl:  process.env.ESEWA_GATEWAY_URL  || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
};

function generateSignature(message) {
  return crypto
    .createHmac('sha256', ESEWA_CONFIG.secretKey)
    .update(message)
    .digest('base64');
}

const initiatePayment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) { res.status(404); throw new Error('Appointment not found'); }

  const transactionUuid = `JA-${appointmentId}-${Date.now()}`;
  const amount = appointment.amount;
  const productCode = ESEWA_CONFIG.merchantId;
  const signatureMessage = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = generateSignature(signatureMessage);

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  await Payment.create({
    user: req.user._id,
    appointment: appointmentId,
    esewaTransactionUuid: transactionUuid,
    amount,
    currency: 'NPR',
    status: 'created',
  });

  res.json({
    success: true,
    gatewayUrl: ESEWA_CONFIG.gatewayUrl,
    formData: {
      amount: amount.toString(),
      tax_amount: '0',
      total_amount: amount.toString(),
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${baseUrl}/payment/success?appointmentId=${appointmentId}`,
      failure_url: `${baseUrl}/payment/failure?appointmentId=${appointmentId}`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    },
  });
});

const verifyEsewaPayment = asyncHandler(async (req, res) => {
  const { data, appointmentId } = req.body;
  if (!data) { res.status(400); throw new Error('No payment data'); }

  const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  const { status, signed_field_names, signature } = decoded;

  const signedFields = signed_field_names.split(',');
  const signatureMsg = signedFields.map(f => `${f}=${decoded[f]}`).join(',');
  const expectedSig = generateSignature(signatureMsg);

  if (expectedSig !== signature) { res.status(400); throw new Error('Signature mismatch'); }
  if (status !== 'COMPLETE') { res.status(400); throw new Error('Payment not complete'); }

  await Payment.findOneAndUpdate(
    { esewaTransactionUuid: decoded.transaction_uuid },
    { esewaRefId: decoded.transaction_code, status: 'paid' }
  );
  await Appointment.findByIdAndUpdate(appointmentId, {
    paymentStatus: 'paid',
    paymentId: decoded.transaction_code,
    status: 'confirmed',
  });

  res.json({ success: true, message: 'payment success' });
});

const freeConfirm = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) { res.status(404); throw new Error('Not found'); }

  await Appointment.findByIdAndUpdate(appointmentId, {
    paymentStatus: 'paid',
    status: 'confirmed',
  });
  await Payment.create({
    user: req.user._id,
    appointment: appointmentId,
    amount: appointment.amount,
    currency: 'NPR',
    status: 'paid',
  });

  res.json({ success: true, message: 'Confirmed (Test Mode)' });
});

const getMyPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('appointment', 'date startTime type status')
    .sort({ createdAt: -1 });
  res.json({ success: true, payments });
});

module.exports = { initiatePayment, verifyEsewaPayment, freeConfirm, getMyPaymentHistory };
    