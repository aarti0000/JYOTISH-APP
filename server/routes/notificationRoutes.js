const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Notification } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/', protect, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, notifications });
}));

router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
}));

router.put('/read-all', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
}));

module.exports = router;
