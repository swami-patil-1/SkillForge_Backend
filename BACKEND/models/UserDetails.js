const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  name: {
    type: String,
    required: true,
  },
  location: String,
  skills: [String],
  interestedSkills: [String],
  profilePic: String,
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);

module.exports = UserDetails;
