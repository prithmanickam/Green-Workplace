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
        Company(name)
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
      totalCarbonFootprint: 0,
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

      const carbonFootprints = [team.monday_cf, team.tuesday_cf, team.wednesday_cf, team.thursday_cf, team.friday_cf];

      // calculate the carbon footprint sum, handling null values with 0
      let teamCarbonFootprint = carbonFootprints.reduce((acc, value) => (acc + (value || 0)), 0);

      yourDashboardInfo.totalCarbonFootprint += teamCarbonFootprint;

      teamCarbonFootprint = teamCarbonFootprint.toFixed(2);

      yourDashboardInfo.teams.push([teamInfo, teamCarbonFootprint]);
    }

    res.status(200).json({ status: "ok", data: yourDashboardInfo });
  } catch (error) {
    //console.log(error)
    res.status(500).json({ status: "error" });
  }
};


//post users work at office preference to a specific team
module.exports.postWorkAtOfficePreference = async (req, res) => {
  const { user_id, team_id, selected_days } = req.body;

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


// Get teams the user is in from the database
module.exports.getUserTeams = async (req, res) => {
  const { user_id } = req.body;

  try {

    const { data: user_teams, getUserTeamsError } = await supabase
      .from("Team_Member")
      .select(`
      team_id,
      Team(name)
    `)
      .eq("user_id", user_id);

    if (getUserTeamsError) {
      console.error("Error finding team:", getUserTeamsError);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok", user_teams });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Get the team dashboard data
module.exports.getTeamDashboardData = async (req, res) => {
  const { team_id } = req.body;

  try {
    const { data: team, getTeamError } = await supabase
      .from("Team")
      .select(`
        id,
        name, 
        divisions, 
        team_created, 
        Company(name), 
        User(email)
      `)
      .eq("id", team_id);

    if (getTeamError) {
      console.error("Error finding team name:", getTeamError);
      return res.status(500).json({ status: "error" });
    }

    const teamInfo = {
      id: team[0].id,
      name: team[0].name,
      email: team[0].User.email,
      company: team[0].Company.name,
      divisions: team[0].divisions,
      team_created: team[0].team_created,
      carbon_footprint_total: 0,
      carbon_footprint_metric: 0,
      team_members: [],
    }

    const { data: team_members_info, getTeamMemberError } = await supabase
      .from("Team_Member")
      .select(`
        monday_cf,
        tuesday_cf,
        wednesday_cf,
        thursday_cf,
        friday_cf,
        wao_preference,
        User(firstname, lastname, email)
      `)
      .eq("team_id", team_id);

    if (getTeamMemberError) {
      console.error("Error finding team name:", getTeamDetailsError);
      return res.status(500).json({ status: "error" });
    }

    for (const member of team_members_info) {
      const carbonFootprintSum =
        member.monday_cf +
        member.tuesday_cf +
        member.wednesday_cf +
        member.thursday_cf +
        member.friday_cf;

      const teamMemberInfo = {
        firstname: member.User.firstname,
        lastname: member.User.lastname,
        email: member.User.email,
        wao_preference: member.wao_preference,
        carbon_footprint: carbonFootprintSum.toFixed(2),
      };

      teamInfo.team_members.push(teamMemberInfo);
      teamInfo.carbon_footprint_total += carbonFootprintSum;
    }

    if (!isNaN(teamInfo.carbon_footprint_total) && teamInfo.team_members.length > 0) {
      teamInfo.carbon_footprint_metric = (teamInfo.carbon_footprint_total / teamInfo.team_members.length).toFixed(2);
      teamInfo.carbon_footprint_total = (teamInfo.carbon_footprint_total).toFixed(2);
    }

    res.status(200).json({ status: "ok", data: teamInfo });
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: "error" });
  }
};


module.exports.getCompanyDashboardData = async (req, res) => {
  const { company_id } = req.body;

  try {
    const { data: teams, getTeamsError } = await supabase
      .from("Team")
      .select(`
        id,
        name, 
        divisions,
        User(email),
        Team_Member(monday_cf,
          tuesday_cf,
          wednesday_cf,
          thursday_cf,
          friday_cf)
      `)
      .eq("company_id", company_id);

    if (getTeamsError) {
      console.error("Error finding teams:", getTeamsError);
      return res.status(500).json({ status: "error" });
    }

    const teamsInfo = [];
    let totalCompanyCarbonFootprint = 0;
    let totalCompanyMembers = 0;

    for (const team of teams) {
      // Calculate the carbon footprint sum for this team
      const carbonFootprintSum = team.Team_Member.reduce((sum, member) => {
        const daySum = member.monday_cf + member.tuesday_cf + member.wednesday_cf + member.thursday_cf + member.friday_cf;
        return sum + daySum;
      }, 0);

      // Calculate the carbon footprint average
      const totalMembers = team.Team_Member.length;
      const carbonFootprintAverage = totalMembers > 0 ? (carbonFootprintSum / totalMembers).toFixed(2) : 'N/A';

      // Team information object
      const teamInfo = {
        id: team.id,
        name: team.name,
        ownerEmail: team.User.email,
        division: team.divisions,
        carbonFootprintAverage: carbonFootprintAverage,
        numberOfMembers: totalMembers,
        carbonFootprintTotal: carbonFootprintSum.toFixed(2),
      };

      teamsInfo.push(teamInfo);

      // Update company-wide totals
      totalCompanyCarbonFootprint += carbonFootprintSum;
      totalCompanyMembers += totalMembers;
    }

    // Calculate the average and total carbon footprint for the entire company
    const averageCompanyCarbonFootprint = totalCompanyMembers > 0 ? (totalCompanyCarbonFootprint / totalCompanyMembers).toFixed(2) : 'N/A';

    const companyInfo = {
      name: 'No Name', 
      averageCarbonFootprint: averageCompanyCarbonFootprint,
      totalCarbonFootprint: totalCompanyCarbonFootprint.toFixed(2),
    };

    const { data: companyName, getCompanyNameError } = await supabase
      .from("Company")
      .select("name")
      .eq("id", company_id);

    if (getCompanyNameError) {
      console.error("Error finding teams:", getCompanyNameError);
      return res.status(500).json({ status: "error" });
    }
    
    companyInfo.name = companyName[0].name

    res.status(200).json({ status: "ok", teamsInfo, companyInfo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error" });
  }
};