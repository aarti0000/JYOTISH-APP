const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({
  name,

  username: email.split("@")[0],

  email,
  password,
  phone,
  role
});

  
  // If registering as astrologer, create astrologer profile
  if (role === 'astrologer') {
    await Astrologer.create({ user: user._id, pricePerMinute: 20, consultationTypes: ['chat'] });
  }

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar,
    },
  });
});

// @POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account has been deactivated');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar,
    },
  });
});

// @GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

// @PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, getMe, changePassword };
