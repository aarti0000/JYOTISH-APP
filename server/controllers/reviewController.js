const asyncHandler = require('express-async-handler');
const { Review } = require('../models/index');
const Astrologer = require('../models/Astrologer');
const Appointment = require('../models/Appointment');

// @POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { astrologerId, appointmentId, rating, comment } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || appointment.status !== 'completed') {
    res.status(400);
    throw new Error('Can only review completed consultations');
  }
  if (appointment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const existing = await Review.findOne({ user: req.user._id, appointment: appointmentId });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this consultation');
  }

  const review = await Review.create({
    user: req.user._id, astrologer: astrologerId,
    appointment: appointmentId, rating, comment,
  });

  // Update astrologer's rating
  const reviews = await Review.find({ astrologer: astrologerId });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Astrologer.findByIdAndUpdate(astrologerId, {
    rating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length,
  });

  res.status(201).json({ success: true, review });
});

// @GET /api/reviews/astrologer/:id
const getAstrologerReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Review.countDocuments({ astrologer: req.params.id });
  const reviews = await Review.find({ astrologer: req.params.id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, reviews });
});

module.exports = { createReview, getAstrologerReviews };
