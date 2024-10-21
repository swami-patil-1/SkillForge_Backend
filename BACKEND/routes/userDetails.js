const express = require('express');
const UserDetails = require('../models/UserDetails');  // Adjust the path according to your project structure
const router = express.Router();

// Middleware to check if the user is authenticated
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  next();
};

// Get user details route
router.get('/details', authMiddleware, async (req, res) => {
  try {
    const userDetails = await UserDetails.findOne({ userId: req.session.user.id });
    if (!userDetails) {
      return res.status(404).json({ msg: 'User details not found' });
    }
    res.json(userDetails);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update user details route
router.put('/details', authMiddleware, async (req, res) => {
  try {
    const { profilePic, location, skills, interestedSkills } = req.body;

    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { userId: req.session.user.id },
      { profilePic, location, skills, interestedSkills },
      { new: true, runValidators: true }
    );

    if (!updatedUserDetails) {
      return res.status(404).json({ msg: 'User details not found' });
    }

    res.json({ msg: 'User details updated successfully', updatedUserDetails });
  } catch (err) {
    console.error('Error updating user details:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Export the router
module.exports = router;
