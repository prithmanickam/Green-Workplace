const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    type: { type: String, default: "Team Member" }, // Team member, team owner, or admin
    email: { type: String, unique: true },
    password: String,
    accountCreated: { type: Date, default: Date.now },
    company: String,
    team: String,
    profilePicture: String,
    workAtOfficePreference: [String],
    weeklyMetric: [],
    currentWeekStats: {
      Monday: {
        duration: String,
        carbon: Number,
      },
      Tuesday: {
        duration: String,
        carbon: Number,
      },
      Wednesday: {
        duration: String,
        carbon: Number,
      },
      Thursday: {
        duration: String,
        carbon: Number,
      },
      Friday: {
        duration: String,
        carbon: Number,
      },
    },
  }
);

const User = mongoose.model("users", UserSchema);

module.exports = User;
