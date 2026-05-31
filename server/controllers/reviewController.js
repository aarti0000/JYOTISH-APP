const asyncHandler = require('express-async-handler');
const { Review }   = require('../models/index');
const Astrologer   = require('../models/Astrologer');
const Appointment  = require('../models/Appointment');

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { astrologerId, appointmentId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Allow review if completed OR if consultation just ended (ongoing→completed transition)
  if (!['completed','ongoing'].includes(appointment.status)) {
    res.status(400);
    throw new Error('Can only review after consultation is completed');
  }

  if (appointment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to review this appointment');
  }

  // Check duplicate
  const existing = await Review.findOne({
    user: req.user._id,
    appointment: appointmentId,
  });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this consultation');
  }

  const review = await Review.create({
    user:        req.user._id,
    astrologer:  astrologerId,
    appointment: appointmentId,
    rating:      Number(rating),
    comment:     comment || '',
  });

  // Recalculate astrologer's average rating
  const allReviews = await Review.find({ astrologer: astrologerId });
  const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await Astrologer.findByIdAndUpdate(astrologerId, {
    rating:       Math.round(avgRating * 10) / 10,
    totalReviews: allReviews.length,
  });

  const populated = await Review.findById(review._id).populate('user','name avatar');
  res.status(201).json({ success:true, review:populated });
});

// GET /api/reviews/astrologer/:id
const getAstrologerReviews = asyncHandler(async (req, res) => {
  const { page=1, limit=10 } = req.query;
  const total   = await Review.countDocuments({ astrologer:req.params.id });
  const reviews = await Review.find({ astrologer:req.params.id })
    .populate('user','name avatar')
    .sort({ createdAt:-1 })
    .skip((page-1)*limit)
    .limit(Number(limit));
  res.json({ success:true, total, reviews });
});

// GET /api/reviews/check/:appointmentId — check if already reviewed
const checkReviewed = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    user:        req.user._id,
    appointment: req.params.appointmentId,
  });
  res.json({ success:true, reviewed: !!review, review });
});

module.exports = { createReview, getAstrologerReviews, checkReviewed };