const mongoose = require('mongoose');

const astrologerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: String,
  experience: { type: Number, default: 0 },
  specializations: [{ type: String, enum: ['Vedic','Numerology','Tarot','Vastu','KP','Palmistry','Gemology','Prashna'] }],
  languages: [String],
  pricePerMinute: { type: Number, default: 20 },
  consultationTypes: [{ type: String, enum: ['chat','call','video'] }],

  // Working hours — set once, auto-generates slots every day
  workingHours: {
    startTime:    { type: String, default: '09:00' }, // e.g. "09:00"
    endTime:      { type: String, default: '17:00' }, // e.g. "17:00"
    slotDuration: { type: Number, default: 60 },      // minutes per slot
    workingDays:  { type: [Number], default: [0,1,2,3,4,5,6] }, // 0=Sun,1=Mon...6=Sat
  },

  // Dates the astrologer is NOT available (holidays, days off)
  blockedDates: [{ type: String }], // ["2024-12-25", "2024-12-26"]

  rating:             { type: Number, default: 0 },
  totalReviews:       { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },
  isOnline:           { type: Boolean, default: false },
  isApproved:         { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Astrologer', astrologerSchema);