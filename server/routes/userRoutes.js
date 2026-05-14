const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateAvatar, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.get('/:id', getUserById);

module.exports = router;
