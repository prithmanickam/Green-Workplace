const mongoose = require("mongoose");

const JourneySchema = new mongoose.Schema({
  transport: String,
  duration: Number,
});

 const UserSchema = new mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    type: String, //team member team owner or admin
    email: { type: String, unique: true },
    password: String,
    accountCreated: { type: Date, default: Date.now },
    profilePicture: String,
    travelHistory: {
    type: Map,
    of: {
      carbonFootprint: Number,
      journeys: [JourneySchema],
    },
  },
    workAtOfficePreference: [String],
    weeklyMetric: [Number],
    team: String,
    company: String,
  },
);

const User = mongoose.model("users", UserSchema); 

module.exports = User; 