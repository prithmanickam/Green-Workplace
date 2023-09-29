const mongoose = require("mongoose");

 const UserSchema = new mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    type: { type: String, default: "Team Member" }, //team member, team owner, or admin
    email: { type: String, unique: true },
    password: String,
    accountCreated: { type: Date, default: Date.now },
    company: String,
    team: String,
    profilePicture: { type: String, default: "defaultProfilePicture.png" },
    workAtOfficePreference: [String],
    weeklyMetric: [Number],
    
  },
);

const User = mongoose.model("users", UserSchema); 

module.exports = User; 