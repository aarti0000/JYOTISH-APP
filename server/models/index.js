const mongoose = require('mongoose');

// ── Payment ──────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
  type: { type: String, enum: ['appointment', 'wallet_topup'], default: 'appointment' },
}, { timestamps: true });

// ── Review ────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

// ── Kundali ───────────────────────────────────────────────────
const kundaliSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  timeOfBirth: { type: String, required: true },
  placeOfBirth: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  timezone: { type: String },
  chartData: { type: Object },    // raw planetary positions from Swiss Ephemeris
  lagna: { type: String },        // Ascendant sign
  moonSign: { type: String },
  sunSign: { type: String },
  nakshatra: { type: String },
  dashaData: { type: Object },    // Vimshottari dasha
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

// ── Notification ──────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['appointment', 'payment', 'review', 'system', 'reminder'] },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true });

module.exports.Payment      = mongoose.model('Payment', paymentSchema);
module.exports.Review       = mongoose.model('Review', reviewSchema);
module.exports.Kundali      = mongoose.model('Kundali', kundaliSchema);
module.exports.Notification = mongoose.model('Notification', notificationSchema);
