// routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Route to get user data by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email skills interests currentJobRole cv');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to update user profile
router.put('/profile/:id', async (req, res) => {
  const { name, email, skills, interests, currentJobRole, cv } = req.body;
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.skills = skills || user.skills;
    user.interests = interests || user.interests;
    user.currentJobRole = currentJobRole || user.currentJobRole;
    user.cv = cv || user.cv;

    await user.save();
    res.json({ msg: 'Profile updated', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;