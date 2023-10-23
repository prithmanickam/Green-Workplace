const supabase = require("../config/supabaseConfig");

// Add the team to the database (for admin)
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
      //console.log("no team owner id")
      return res.status(404).json({ error: "Team Owner user not found" });
    }

    const team_owner_id = team_owner.id

    if (getUserError) {
      //console.error("Cannot find user:", getUserError);
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
    ]).select();

    if (createTeamError) {
      //console.error("Error creating team:", error);
      return res.status(500).json({ status: "error" });
    }

    // Find the team ID
    const team_id = createdTeam[0].id;

    // Add the team owner to the "Team_Member" table

    const { error: teamOwnerAddError } = await supabase.from("Team_Member").upsert([
      //await supabase.from("Team_Member").upsert([
      {
        team_id,
        user_id: team_owner_id,
      },
    ]);

    if (teamOwnerAddError) {
      //console.error("Error adding team owner: ", error);
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
        //console.error("Cannot find user:", getUserError);
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
        //console.error("Error adding team member:", error);
        return res.status(500).json({ status: "error" });
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    //console.error("Error:", error);
    res.status(500).json({ status: "error" });
  }
};

// get all teams in the database (for admin)
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
      //console.error("Error fetching teams:", error);
      return res.status(500).json({ status: "error" });
    }

    // Extract the desired properties for each team and add them to allTeamsData
    for (const team of allTeams) {

      const { data: team_info, getTeamInfoError } = await supabase
        .from("Team")
        .select(`User(email), Office(name), Team_Member(count) `)
        .eq("id", team.id)
        .single();
      
      //console.log(team_info)

      if (getTeamInfoError) {
        //console.error("Error finding team owner email:", error);
        return res.status(500).json({ status: "error" });
      }

      const teamData = {
        team_id: team.id,
        team_owner_email: team_info.User.email,
        office_name: team_info.Office.name,
        name: team.name,
        team_members_count: team_info.Team_Member[0].count,
      };
      allTeamsData.push(teamData);
    }

    res.status(200).json({ status: "ok", teams: allTeamsData });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Delete the team in the database (for Admin)
module.exports.deleteTeam = async (req, res) => {
  const { teamId } = req.body;

  try {
    // Delete associated team members from the Team_Member table
    const { error: deleteMembersError } = await supabase
      .from("Team_Member")
      .delete()
      .eq("team_id", teamId);

    if (deleteMembersError) {
      //console.error("Error deleting team members:", deleteMembersError);
      return res.status(500).json({ status: "error" });
    }

    // Delete the team
    const { error: deleteError } = await supabase
      .from("Team")
      .delete()
      .eq("id", teamId);

    if (deleteError) {
      //console.error("Error deleting team:", deleteError);
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
  const { user_id } = req.body;

  try {

    // find teams user is in
    const { data: user_teams, getUserTeamsError } = await supabase
      .from("Team_Member")
      .select("team_id")
      .eq("user_id", user_id);

    if (getUserTeamsError) {
      //console.error("Error finding user teams:", getUserTeamsError);
      return res.status(500).json({ status: "error" });
    }

    const teams = []

    for (const team of user_teams) {

      const { data: teamName, getTeamNameError } = await supabase
        .from("Team")
        .select("name")
        .eq("id", team.team_id);

      if (getTeamNameError) {
        //console.error("Error finding team name:", getTeamNameError);
        return res.status(500).json({ status: "error" });
      }

      const teamData = {
        teamId: team.team_id,
        teamName: teamName[0].name,
      };

      teams.push(teamData);
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
      //console.error("Error fetching offices:", error);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok", data: data });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};


// Get the users dashboard data
module.exports.getYourDashboardData = async (req, res) => {
  const { user_id } = req.body;

  try {
    const { data: user_details, getUserDetailsError } = await supabase
      .from("User")
      .select(`
        firstname,
        lastname, 
        email, 
        account_created,
        Company(name), 
        User_Monday_Stats(carbon_footprint),
        User_Tuesday_Stats(carbon_footprint),
        User_Wednesday_Stats(carbon_footprint),
        User_Thursday_Stats(carbon_footprint),
        User_Friday_Stats(carbon_footprint)
      `)
      .eq("id", user_id);

    if (getUserDetailsError) {
      //console.error("Error finding team name:", getUserDetailsError);
      return res.status(500).json({ status: "error" });
    }

    const yourDashboardInfo = {
      name: user_details[0].firstname + " " + user_details[0].lastname,
      email: user_details[0].email,
      company: user_details[0].Company.name,
      accountCreated: user_details[0].account_created,
      totalCarbonFootprint:
        (user_details[0].User_Monday_Stats?.carbon_footprint || 0) +
        (user_details[0].User_Tuesday_Stats?.carbon_footprint || 0) +
        (user_details[0].User_Wednesday_Stats?.carbon_footprint || 0) +
        (user_details[0].User_Thursday_Stats?.carbon_footprint || 0) +
        (user_details[0].User_Friday_Stats?.carbon_footprint || 0),
      teams: [],
    }

    const { data: user_teams } = await supabase
      .from("Team_Member")
      .select(`
        monday_cf,
        tuesday_cf,
        wednesday_cf,
        thursday_cf,
        friday_cf,
        wao_preference,
        Team(id, name, User(firstname, lastname))
      `)
      .eq("user_id", user_id);

    for (const team of user_teams) {
      const teamInfo = {
        teamId: team.Team.id,
        firstname: team.Team.User.firstname,
        lastname: team.Team.User.lastname,
        teamName: team.Team.name,
        wao_preference: team.wao_preference,
      }
      console.log(teamInfo)

      //const teamId = team.team_id;
      const carbonFootprints = [team.monday_cf, team.tuesday_cf, team.wednesday_cf, team.thursday_cf, team.friday_cf];

      // Use reduce to calculate the sum, handling null values with || 0
      const totalCarbonFootprint = carbonFootprints.reduce((acc, value) => (acc + (value || 0)), 0);

      yourDashboardInfo.teams.push([teamInfo, totalCarbonFootprint]);
    }

    //console.log(yourDashboardInfo)

    res.status(200).json({ status: "ok", data: yourDashboardInfo });
  } catch (error) {
    //console.log(error)
    res.status(500).json({ status: "error" });
  }
};


//post users work at office preference to a specific team
module.exports.postWorkAtOfficePreference = async (req, res) => {
  const { user_id, team_id, selected_days } = req.body;

  console.log(user_id, team_id, selected_days)

  try {

    const { error: postPreferenceError } = await supabase
        .from("Team_Member")
        .update(
          {
            wao_preference: selected_days,
          },
        ).eq("user_id", user_id).eq("team_id", team_id);

    if (postPreferenceError) {
      //console.error("Error posting preference:", postPreferenceError);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};