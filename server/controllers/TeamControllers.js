const Team = require("../models/TeamModel");
const User = require("../models/UserModel");

// Register the team to the database
module.exports.addTeam = async (req, res) => {
  const {
    teamOwner,
    teamName,
    divisions,
    office,
    company,
    teamMembers,
  } = req.body;

  try {
    const email = [teamOwner];
    const newTeamOwner = await User.findOne({ email });

    if (!newTeamOwner) {
      return res.status(404).json({ error: "User not found" });
    }

    if (newTeamOwner.teamOwner !== null) {
      return res.status(409).json({ error: "User is already a team owner" });
    }

    // Initialising a new team
    const newTeam = new Team({
      teamOwner: newTeamOwner,
      teamName,
      divisions,
      office,
      company,
    });

    // Initialize the newTeamMembers array with the team owner
    const newTeamMembers = [newTeamOwner];

    // Loop through the teamMembers email array and add members to the team (if it's not empty)
    if (teamMembers && teamMembers.length > 0) {
      for (const memberEmail of teamMembers) {
        const member = await User.findOne({ email: memberEmail });
        if (member) {
          newTeamMembers.push(member);

          // Push the new team to the member's teams array
          member.teams.push(newTeam);
          await member.save();
        }
      }
    }

    // Set the teamMembers property of newTeam
    newTeam.teamMembers = newTeamMembers;

    // Save the newTeam to the database
    await newTeam.save();

    // Update the team owner
    newTeamOwner.teamOwner = newTeam;
    newTeamOwner.teams.push(newTeam);
    await newTeamOwner.save();

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
    console.log(error);
  }
};

// get all teams in the database
module.exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('teamOwner')
      .populate('teamMembers');
    res.status(200).json({ status: "ok", teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};