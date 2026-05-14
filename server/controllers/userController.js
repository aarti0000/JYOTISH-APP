const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

// @PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, dateOfBirth, timeOfBirth, placeOfBirth, gender, language } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, dateOfBirth, timeOfBirth, placeOfBirth, gender, language },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({ success: true, user });
});

// @PUT /api/users/avatar
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image uploaded');
  }
  // Delete old avatar from cloudinary if exists
  const user = await User.findById(req.user._id);
  if (user.avatar) {
    const publicId = user.avatar.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`jyotish-app/${publicId}`).catch(() => {});
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path },
    { new: true }
  ).select('-password');

  res.json({ success: true, avatar: updatedUser.avatar });
});

// @GET /api/users/:id  (public profile)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name avatar role createdAt');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

module.exports = { getProfile, updateProfile, updateAvatar, getUserById };
