const Team = require("../models/TeamModel");
const User = require("../models/UserModel");
const supabase = require("../config/supabaseConfig");

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

    // Find the team owner
    const { data: team_owner, getUserError } = await supabase
      .from("User")
      .select("*")
      .eq("email", teamOwner)
      .single();

    if (!team_owner) {
      console.log("no team owner id")
      return res.status(404).json({ error: "Team Owner user not found" });
    }

    const team_owner_id = team_owner.id

    if (getUserError) {
      console.error("Cannot find user:", getUserError);
      return res.status(500).json({ status: "error" });
    }

    // Prevents there being a team with the same name in that division
    const team_identifier = `${company}_${divisions}_${teamName}`;

    // Create the team
    const { data: createdTeam, error: createTeamError } = await supabase.from("Team").upsert([
      {
        team_owner_id,
        name: teamName,
        divisions,
        office_id: office,
        company_id: company,
        team_identifier,

      },
    ]);

    if (createTeamError) {
      console.error("Error creating team:", error);
      return res.status(500).json({ status: "error" });
    }

    const { data: team, error: teamError } = await supabase
      .from("Team")
      .select("id")
      .eq("team_identifier", team_identifier)
      .single();

    if (teamError) {
      console.error("Error fetching team:", error);
      return res.status(500).json({ status: "error" });
    }

    // Find the team ID
    const team_id = team.id;

    // Add the team owner to the "Team_Member" table

    const { error: teamOwnerAddError } = await supabase.from("Team_Member").upsert([
      //await supabase.from("Team_Member").upsert([
      {
        team_id,
        user_id: team_owner_id,
      },
    ]);

    if (teamOwnerAddError) {
      console.error("Error adding team owner: ", error);
      return res.status(500).json({ status: "error" });
    }

    // Add team members to the "Team_Member" table
    for (const memberEmail of teamMembers) {
      const { data: user_id, getUserError } = await supabase
        .from("User")
        .select("id")
        .eq("email", memberEmail)
        .single();

      if (getUserError) {
        console.error("Cannot find user:", getUserError);
        return res.status(500).json({ status: "error" });
      }

      const { error: teamMemberAddError } = await supabase.from("Team_Member").upsert([
        //await supabase.from("Team_Member").upsert([
        {
          team_id,
          user_id: user_id.id,
        },
      ]);
      if (teamMemberAddError) {
        console.error("Error adding team member:", error);
        return res.status(500).json({ status: "error" });
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error" });
  }
};

// get all teams in the database
module.exports.getTeams = async (req, res) => {
  const { company } = req.body;

  try {

    let allTeamsData = []

    // Fetch all the teams
    const { data: allTeams, error } = await supabase
      .from("Team")
      .select("*")
      .eq("company_id", company);

    if (error) {
      console.error("Error fetching teams:", error);
      return res.status(500).json({ status: "error" });
    }

    // Extract the desired properties for each team and add them to allTeamsData
    for (const team of allTeams) {

      // find team owners email
      const { data: team_owner_email, getUserError } = await supabase
        .from("User")
        .select("email")
        .eq("id", team.team_owner_id)
        .single();

      if (getUserError) {
        console.error("Error finding team owner email:", error);
        return res.status(500).json({ status: "error" });
      }

      // find team office name
      const { data: office_name, getOfficeError } = await supabase
        .from("Office")
        .select("name")
        .eq("id", team.office_id)
        .single();

      if (getOfficeError) {
        console.error("Error finding office name:", error);
        return res.status(500).json({ status: "error" });
      }

      // Find the number of team members based on team_id
      const { data: team_members, teamMembersError } = await supabase
        .from("Team_Member")
        //.select("COUNT(*)")
        .select("id")
        .eq("team_id", team.id)
      //.single();

      if (teamMembersError) {
        console.error("Error fetching team members:", teamMembersError);
        return res.status(500).json({ status: "error" });
      }

      const teamData = {
        team_id: team.id,
        team_owner_email: team_owner_email.email,
        office_name: office_name.name,
        name: team.name,
        team_members_count: team_members.length,
      };
      allTeamsData.push(teamData);
    }

    res.status(200).json({ status: "ok", teams: allTeamsData });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Register the team to the database
module.exports.deleteTeam = async (req, res) => {
  const { teamId } = req.body;

  try {
    // Delete associated team members from the Team_Member table
    const { error: deleteMembersError } = await supabase
      .from("Team_Member")
      .delete()
      .eq("team_id", teamId);

    if (deleteMembersError) {
      console.error("Error deleting team members:", deleteMembersError);
      return res.status(500).json({ status: "error" });
    }

    // Delete the team
    const { error: deleteError } = await supabase
      .from("Team")
      .delete()
      .eq("id", teamId);

    if (deleteError) {
      console.error("Error deleting team:", deleteError);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
    //console.log(error);
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

// Get offices in the company from the database
module.exports.getOffices = async (req, res) => {
  const { company } = req.body;

  try {

    const { data, error } = await supabase
      .from("Office")
      .select("*")
      .eq("company_id", company);

    if (error) {
      console.error("Error fetching offices:", error);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok", data: data });
  } catch (error) {
    console.error(error);
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
