const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const consultationSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  type: { type: String, enum: ['chat', 'call', 'video'], required: true },
  status: { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  startedAt: { type: Date },
  endedAt: { type: Date },
  duration: { type: Number },   // actual minutes
  messages: [messageSchema],
  astrologerNotes: { type: String },    // private notes for astrologer
  reportSent: { type: String },         // URL to PDF report if sent
  recordingUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
