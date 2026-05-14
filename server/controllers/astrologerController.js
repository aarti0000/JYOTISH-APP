const asyncHandler = require('express-async-handler');
const Astrologer = require('../models/Astrologer');
const User = require('../models/User');

// @GET /api/astrologers  - list/search astrologers
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

  let sortObj = {};
  if (sort === 'rating') sortObj = { rating: -1 };
  else if (sort === 'price_low') sortObj = { pricePerMinute: 1 };
  else if (sort === 'price_high') sortObj = { pricePerMinute: -1 };
  else if (sort === 'experience') sortObj = { experience: -1 };
  else sortObj = { rating: -1 };

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
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  res.json({ success: true, astrologer });
});

// @GET /api/astrologers/my-profile  (for logged-in astrologer)
const getMyAstrologerProfile = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findOne({ user: req.user._id })
    .populate('user', 'name avatar email phone');
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer profile not found');
  }
  res.json({ success: true, astrologer });
});

// @PUT /api/astrologers/my-profile
const updateAstrologerProfile = asyncHandler(async (req, res) => {
  const { bio, experience, specializations, languages, pricePerMinute, consultationTypes } = req.body;

  const astrologer = await Astrologer.findOneAndUpdate(
    { user: req.user._id },
    { bio, experience, specializations, languages, pricePerMinute, consultationTypes },
    { new: true, upsert: true }
  ).populate('user', 'name avatar email');

  res.json({ success: true, astrologer });
});

// @POST /api/astrologers/slots  — add available slots
const addSlots = asyncHandler(async (req, res) => {
  const { slots } = req.body; // array of { date, startTime, endTime }
  const astrologer = await Astrologer.findOne({ user: req.user._id });
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer profile not found');
  }
  astrologer.availableSlots.push(...slots);
  await astrologer.save();
  res.json({ success: true, message: 'Slots added', slots: astrologer.availableSlots });
});

// @GET /api/astrologers/:id/slots?date=YYYY-MM-DD
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const astrologer = await Astrologer.findById(req.params.id);
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  const slots = date
    ? astrologer.availableSlots.filter(s => s.date === date && !s.isBooked)
    : astrologer.availableSlots.filter(s => !s.isBooked);
  res.json({ success: true, slots });
});

// @PUT /api/astrologers/online-status
const toggleOnlineStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  const astrologer = await Astrologer.findOneAndUpdate(
    { user: req.user._id },
    { isOnline },
    { new: true }
  );
  res.json({ success: true, isOnline: astrologer.isOnline });
});

module.exports = {
  getAstrologers, getAstrologerById, getMyAstrologerProfile,
  updateAstrologerProfile, addSlots, getAvailableSlots, toggleOnlineStatus,
};
