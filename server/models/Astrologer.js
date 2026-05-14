const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },   // "YYYY-MM-DD"
  startTime: { type: String, required: true }, // "HH:MM"
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const astrologerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, maxlength: 1000 },
  experience: { type: Number, default: 0 },   // years
  specializations: [{
    type: String,
    enum: ['Vedic', 'Numerology', 'Tarot', 'Vastu', 'KP', 'Palmistry', 'Gemology', 'Prashna'],
  }],
  languages: [{ type: String }],
  pricePerMinute: { type: Number, required: true, default: 20 },  // INR
  consultationTypes: [{
    type: String,
    enum: ['chat', 'call', 'video'],
  }],
  availableSlots: [slotSchema],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },  // admin approves
  documents: [{ type: String }],  // Cloudinary URLs for certificates
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountName: String,
    upiId: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Astrologer', astrologerSchema);
