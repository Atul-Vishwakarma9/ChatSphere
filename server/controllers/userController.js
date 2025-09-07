const router = require('express').Router();
const User = require('./../models/user');
const authMiddleware = require('./../middlewares/authMiddleware');
const cloudinary = require('./../cloudinary');

// Get details of current logged-in user
router.get('/get-logged-user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // ✅ from token

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    res.send({
      message: 'User fetched successfully',
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

// Get all users except logged-in one
router.get('/get-all-users', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ from token

    const allUsers = await User.find({ _id: { $ne: userId } });

    res.send({
      message: 'All users fetched successfully',
      success: true,
      data: allUsers,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

// Upload profile picture
router.post('/upload-profile-pic', authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).send({
        success: false,
        message: 'Image is required',
      });
    }

    // Upload the image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: 'quick-chat',
    });

    // Update the user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, // ✅ from token
      { profilePic: uploadedImage.secure_url },
      { new: true }
    );

    res.send({
      message: 'Profile picture uploaded successfully',
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;
