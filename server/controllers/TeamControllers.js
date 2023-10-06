const Team = require("../models/TeamModel");
const User = require("../models/UserModel");

// Register the team to the database
module.exports.addTeam = async (req, res) => {
  const { teamOwner,
    teamName,
    divisions,
    office,
    company,
    teamMembers, } = req.body;

  try {
    const email = [teamOwner];
    const newTeamOwner = await User.findOne({ email });

    if (!newTeamOwner) {
      return res.status(404).json({ error: "User not found" });
    }


    if (newTeamOwner.teamOwner !== null) {
      return res.status(409).json({ error: "User is already a team owner" });
    }

    const newTeamMembers = [newTeamOwner];

    const newTeam = new Team({
      teamOwner: newTeamOwner,
      teamName,
      divisions,
      office,
      company,
      teamMembers: newTeamMembers,
    });

    await newTeam.save();

    //edit the team owners
    newTeamOwner.teamOwner = newTeam;

    newTeamOwner.teams.push(newTeam);

    // Save the updated team owner
    await newTeamOwner.save();

    //edit the team members

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
    console.log(error);
  }
};

// get all teams in the database
module.exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('teamOwner');
    console.log("teams")
    res.status(200).json({ status: "ok", teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};