const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  date: { type: String, required: true },         // "YYYY-MM-DD"
  startTime: { type: String, required: true },     // "HH:MM"
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },      // minutes
  type: { type: String, enum: ['chat', 'call', 'video'], required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
  },
  amount: { type: Number, required: true },        // total INR
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentId: { type: String },
  userBirthDetails: {
    name: String,
    dateOfBirth: String,
    timeOfBirth: String,
    placeOfBirth: String,
    gender: String,
  },
  question: { type: String, maxlength: 500 },     // user's question/concern
  notes: { type: String },                         // astrologer's pre-notes
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  cancelReason: { type: String },
  rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
