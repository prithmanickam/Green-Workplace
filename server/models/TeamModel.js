const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    teamOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    teamName: String,
    company: String,
    divisions: String,
    office: String, // TODO: should create office schema
    teamMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    }],
    workAtOfficeDays: [String],
    carbonFootprintMetric: Number,
    carbonFootprintTotal: Number,
  }
);

const Team = mongoose.model("teams", TeamSchema);

module.exports = Team;
