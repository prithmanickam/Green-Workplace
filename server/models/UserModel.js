const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    type: { type: String, default: "Team Member" }, // TODO: need to change to employee or admin
  
    email: { type: String, unique: true },
    password: String,
    accountCreated: { type: Date, default: Date.now },
    company: String,

    teamOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'teams', 
      default: null
    },

    teams: [{
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teams', 
      },
      carbonFootprint: { type: Number, default: 0 },
      waoPreference: [String],
      dayStats: {
        Monday: Number,
        Tuesday: Number,
        Wednesday: Number,
        Thursday: Number,
        Friday: Number,
      }
    }],
    
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
