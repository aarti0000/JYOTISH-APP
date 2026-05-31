
const asyncHandler = require('express-async-handler');
const Astrologer = require('../models/Astrologer');
const Appointment = require('../models/Appointment');

// Generate time slots for a given date based on working hours
function generateSlotsForDate(date, workingHours, blockedDates, bookedSlots) {
  const { startTime, endTime, slotDuration, workingDays } = workingHours;

  // Check if date is blocked
  if (blockedDates.includes(date)) return [];

  // Check if day of week is a working day
  const dayOfWeek = new Date(date).getDay();
  if (!workingDays.includes(dayOfWeek)) return [];

  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH,   endM  ] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end   = endH   * 60 + endM;

  while (current + slotDuration <= end) {
    const slotStart = String(Math.floor(current / 60)).padStart(2, '0') + ':' +
                      String(current % 60).padStart(2, '0');
    const slotEnd   = String(Math.floor((current + slotDuration) / 60)).padStart(2, '0') + ':' +
                      String((current + slotDuration) % 60).padStart(2, '0');

    // Check if this slot is already booked
    const isBooked = bookedSlots.some(b => b.date === date && b.startTime === slotStart);

    slots.push({
      date,
      startTime: slotStart,
      endTime:   slotEnd,
      isBooked,
    });

    current += slotDuration;
  }

  return slots;
}

// Get slots for next N days
function getUpcomingSlots(workingHours, blockedDates, bookedSlots, days = 14) {
  const allSlots = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const slots = generateSlotsForDate(dateStr, workingHours, blockedDates, bookedSlots);
    allSlots.push(...slots);
  }
  return allSlots;
}

// @GET /api/astrologers
const getAstrologers = asyncHandler(async (req, res) => {
  const { specialization, language, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  const filter = { isApproved: true };
  if (specialization) filter.specializations = specialization;
  if (language) filter.languages = language;
  if (minPrice || maxPrice) {
    filter.pricePerMinute = {};
    if (minPrice) filter.pricePerMinute.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerMinute.$lte = Number(maxPrice);
  }
  const sortObj = sort === 'price_low' ? { pricePerMinute: 1 }
    : sort === 'price_high' ? { pricePerMinute: -1 }
    : sort === 'experience' ? { experience: -1 }
    : { rating: -1 };

  const total = await Astrologer.countDocuments(filter);
  const astrologers = await Astrologer.find(filter)
    .populate('user', 'name avatar email isActive')
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), astrologers });
});

// @GET /api/astrologers/:id
const getAstrologerById = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id)
    .populate('user', 'name avatar email createdAt');
  if (!astrologer) { res.status(404); throw new Error('Astrologer not found'); }
  res.json({ success: true, astrologer });
});

// @GET /api/astrologers/my-profile
const getMyAstrologerProfile = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findOne({ user: req.user._id })
    .populate('user', 'name avatar email phone');
  if (!astrologer) { res.status(404); throw new Error('Profile not found'); }
  res.json({ success: true, astrologer });
});

// @PUT /api/astrologers/my-profile
const updateAstrologerProfile = asyncHandler(async (req, res) => {
  const { bio, experience, specializations, languages, pricePerMinute, consultationTypes, workingHours } = req.body;
  const astrologer = await Astrologer.findOneAndUpdate(
    { user: req.user._id },
    { bio, experience, specializations, languages, pricePerMinute, consultationTypes, workingHours },
    { new: true, upsert: true }
  ).populate('user', 'name avatar email');
  res.json({ success: true, astrologer });
});

// @PUT /api/astrologers/working-hours  — set working hours
const updateWorkingHours = asyncHandler(async (req, res) => {
  const { startTime, endTime, slotDuration, workingDays } = req.body;
  const astrologer = await Astrologer.findOneAndUpdate(
    { user: req.user._id },
    { workingHours: { startTime, endTime, slotDuration: slotDuration || 60, workingDays } },
    { new: true }
  );
  res.json({ success: true, workingHours: astrologer.workingHours });
});

// @POST /api/astrologers/block-date  — block a date (holiday)
const blockDate = asyncHandler(async (req, res) => {
  const { date } = req.body;
  const astrologer = await Astrologer.findOne({ user: req.user._id });
  if (!astrologer.blockedDates.includes(date)) {
    astrologer.blockedDates.push(date);
    await astrologer.save();
  }
  res.json({ success: true, blockedDates: astrologer.blockedDates });
});

// @POST /api/astrologers/unblock-date  — unblock a date
const unblockDate = asyncHandler(async (req, res) => {
  const { date } = req.body;
  const astrologer = await Astrologer.findOne({ user: req.user._id });
  astrologer.blockedDates = astrologer.blockedDates.filter(d => d !== date);
  await astrologer.save();
  res.json({ success: true, blockedDates: astrologer.blockedDates });
});

// @GET /api/astrologers/:id/slots?date=YYYY-MM-DD
// Returns auto-generated slots for that date (or next 14 days if no date)
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const astrologer = await Astrologer.findById(req.params.id);
  if (!astrologer) { res.status(404); throw new Error('Astrologer not found'); }

  // Get already booked slots for this astrologer
  const bookedAppts = await Appointment.find({
    astrologer: astrologer._id,
    status: { $in: ['pending', 'confirmed', 'ongoing'] },
  }).select('date startTime');

  const workingHours = astrologer.workingHours || {
    startTime: '09:00', endTime: '17:00', slotDuration: 60, workingDays: [0,1,2,3,4,5,6],
  };

  if (date) {
    // Return slots for specific date
    const slots = generateSlotsForDate(date, workingHours, astrologer.blockedDates || [], bookedAppts);
    res.json({ success: true, slots });
  } else {
    // Return slots for next 14 days
    const slots = getUpcomingSlots(workingHours, astrologer.blockedDates || [], bookedAppts, 14);
    res.json({ success: true, slots });
  }
});

// @PUT /api/astrologers/online-status
const toggleOnlineStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  const astrologer = await Astrologer.findOneAndUpdate(
    { user: req.user._id }, { isOnline }, { new: true }
  );
  res.json({ success: true, isOnline: astrologer.isOnline });
});

module.exports = {
  getAstrologers, getAstrologerById, getMyAstrologerProfile,
  updateAstrologerProfile, updateWorkingHours, blockDate, unblockDate,
  getAvailableSlots, toggleOnlineStatus,
};