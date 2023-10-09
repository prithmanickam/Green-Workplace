const Team = require("../models/TeamModel");
const User = require("../models/UserModel");

// Add the team to the database
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

    // Initialise the newTeamMembers array with the team owner
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
    //console.log(error);
  }
};

// Register the team to the database
module.exports.deleteTeam = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the team owner by email
    const teamOwner = await User.findOne({ email });

    // Find the team owned by the team owner
    const teamToDelete = await Team.findOne({ teamOwner }).populate('teamMembers');

    if (!teamToDelete) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Set the team owner's 'teamOwner' status to null
    teamOwner.teamOwner = null;
    await teamOwner.save();

    // Remove the team from each team member's 'teams' field
    for (const member of teamToDelete.teamMembers) {

      const memberUser = await User.findOne({ email: member.email })

      if (memberUser) {
        memberUser.teams = memberUser.teams.filter((team) => team._id.toString() !== teamToDelete._id.toString());
        await memberUser.save();
      }
    }

    // Delete the team from the 'teams' collection
    await Team.deleteOne({ _id: teamToDelete._id });

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
    //console.log(error);
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
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Get the teams data for the teams the user is in
module.exports.getUserTeamsData = async (req, res) => {
  const { email } = req.body;

  try {

    const user = await User.findOne({ email });

    const teams = []

    for (const team of user.teams) {
      const teamInfo = await Team.findById(team._id);

      // Populate the team owner's details
      await teamInfo.populate('teamOwner');

      teams.push(teamInfo)
    }

    res.status(200).json({ status: "ok", data: teams });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};

// Get the users dashboard data
module.exports.getYourDashboardData = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    const yourDashboardInfo = {
      name: user.firstname + " " + user.lastname,
      email: user.email,
      company: user.company,
      accountCreated: user.accountCreated,
      totalCarbonFootprint: 0,
      teams: [],
    }

    for (const team of user.teams) {
      const teamInfo = await Team.findById(team._id);

      // Populate the team owner's details
      await teamInfo.populate('teamOwner');

      yourDashboardInfo.teams.push([teamInfo, team.carbonFootprint])
    }

    // Calculate the total carbon footprint
    const totalCarbonFootprint = Object.values(user.currentWeekStats).reduce(
      (total, dayStats) => total + parseFloat(dayStats.carbon || 0),
      0
    ).toFixed(2);

    // Update the totalCarbonFootprint field in yourDashboardInfo
    yourDashboardInfo.totalCarbonFootprint = totalCarbonFootprint;

    res.status(200).json({ status: "ok", data: yourDashboardInfo });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};
