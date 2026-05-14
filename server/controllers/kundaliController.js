const asyncHandler = require('express-async-handler');
const { Kundali } = require('../models/index');
const { generateKundali } = require('../services/kundaliService');

// @POST /api/kundali/generate
const generateChart = asyncHandler(async (req, res) => {
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, latitude, longitude, timezone } = req.body;

  const chartData = await generateKundali({ dateOfBirth, timeOfBirth, latitude, longitude, timezone });

  const kundali = await Kundali.create({
    user: req.user._id,
    name, dateOfBirth, timeOfBirth, placeOfBirth,
    latitude, longitude, timezone,
    chartData: chartData.planets,
    lagna: chartData.lagna,
    moonSign: chartData.moonSign,
    sunSign: chartData.sunSign,
    nakshatra: chartData.nakshatra,
    dashaData: chartData.dasha,
  });

  res.status(201).json({ success: true, kundali });
});

// @GET /api/kundali/my-charts
const getMyKundalis = asyncHandler(async (req, res) => {
  const kundalis = await Kundali.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, kundalis });
});

// @GET /api/kundali/:id
const getKundaliById = asyncHandler(async (req, res) => {
  const kundali = await Kundali.findById(req.params.id);
  if (!kundali) {
    res.status(404);
    throw new Error('Kundali not found');
  }
  if (kundali.user.toString() !== req.user._id.toString() && !kundali.isPublic) {
    res.status(403);
    throw new Error('Not authorized');
  }
  res.json({ success: true, kundali });
});

module.exports = { generateChart, getMyKundalis, getKundaliById };
