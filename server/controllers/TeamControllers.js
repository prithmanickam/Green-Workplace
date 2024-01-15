const supabase = require("../config/supabaseConfig");

// Add the team to the database (for admin)
module.exports.addTeam = async (req, res) => {
  const {
    teamOwner,
    teamName,
    divisions,
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

    // Create the team
    const { data: createdTeam, error: createTeamError } = await supabase.from("Team").upsert([
      {
        team_owner_id,
        name: teamName,
        divisions,
        company_id: company,
      },
    ]).select();

    // Find the team ID
    const team_id = createdTeam[0].id;

    // Add the team owner to the "Team_Member" table

    const { error: teamOwnerAddError } = await supabase.from("Team_Member").upsert([
      {
        team_id,
        user_id: team_owner_id,
      },
    ]);

    // Add team members to the "Team_Member" table
    for (const memberEmail of teamMembers) {
      const { data: user_id, getUserError } = await supabase
        .from("User")
        .select("id")
        .eq("email", memberEmail)
        .single();

      const { error: teamMemberAddError } = await supabase.from("Team_Member").upsert([
        //await supabase.from("Team_Member").upsert([
        {
          team_id,
          user_id: user_id.id,
        },
      ]);

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

    // Extract the desired properties for each team and add them to allTeamsData
    for (const team of allTeams) {

      const { data: team_info, getTeamInfoError } = await supabase
        .from("Team")
        .select(`User(email), Team_Member(count) `)
        .eq("id", team.id)
        .single();

      const teamData = {
        team_id: team.id,
        team_owner_email: team_info.User.email,
        name: team.name,
        team_members_count: team_info.Team_Member[0].count,
        can_delete: team.can_delete,
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

    // Delete the team
    const { error: deleteError } = await supabase
      .from("Team")
      .delete()
      .eq("id", teamId);

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

    const teams = []

    for (const team of user_teams) {

      const { data: teamName, getTeamNameError } = await supabase
        .from("Team")
        .select("name")
        .eq("id", team.team_id);

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

    yourDashboardInfo.totalCarbonFootprint = yourDashboardInfo.totalCarbonFootprint.toFixed(2)

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

    res.status(200).json({ status: "ok", user_teams });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Get teams the user is in from the database
module.exports.getUserTeamOwnerTeams = async (req, res) => {
  const { user_id } = req.body;

  try {
    const { data: user_teams, error: getUserTeamsError } = await supabase
      .from("Team")
      .select(`
         id,
         name
    `)
      .eq("team_owner_id", user_id);


    res.status(200).json({ status: "ok", user_teams });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Get data needed in the team owner functions page from the database
module.exports.getTeamOwnerFunctionsData = async (req, res) => {
  const { company_id, user_email, team_id } = req.body;

  try {
    console.log("Fetching teamInfo...");

    const { data: teamInfo, error: getTeamInfoError } = await supabase
      .from("Team")
      .select(`
         wao_days,
         name
    `)
      .eq("id", team_id);


    const { data: teamMembersToRemove, error: getMembersToRemoveError } = await supabase
      .from("Team_Member")
      .select("User(email)")
      .eq("team_id", team_id);


    const { data: teamMembersToAdd, error: getMembersToAddError } = await supabase
      .from("User")
      .select(`email`)
      .eq("company_id", company_id)
      .eq("type", 'Employee');

    const emailsToRemove = teamMembersToRemove.map(item => item.User.email);
    const teamMembersToAddEmails = teamMembersToAdd.map(item => item.email);

    const teamMembersToAddUnique = Array.from(
      new Set(teamMembersToAddEmails.filter(email => !emailsToRemove.includes(email)))
    );

    const emailsToRemoveWithoutOwner = emailsToRemove.filter(email => email !== user_email);

    res.status(200).json({ status: "ok", teamInfo, teamMembersToAdd: teamMembersToAddUnique, teamMembersToRemove: emailsToRemoveWithoutOwner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Edit team name as a team owner
module.exports.editTeamName = async (req, res) => {
  const { team_id, new_team_name } = req.body;

  try {

    const { editTeamNameError } = await supabase
      .from("Team")
      .update({ name: new_team_name })
      .eq("id", team_id);

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Edit team WAO days as a team owner
module.exports.editTeamWAODays = async (req, res) => {
  const { team_id, selected_days } = req.body;

  try {

    const { editTeamWAODaysError } = await supabase
      .from("Team")
      .update({ wao_days: selected_days })
      .eq("id", team_id);


    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Add team members to a team 
module.exports.addTeamMember = async (req, res) => {
  const { team_id, new_team_member } = req.body;

  try {

    const { data: user_id, error: getUserIdError } = await supabase
      .from("User")
      .select(`
         id,
         Company(temporary_team)
    `)
      .eq("email", new_team_member);


    const { error: addTeamMemberError } = await supabase
      .from("Team_Member")
      .insert([
        { "user_id": user_id[0].id, "team_id": team_id },
      ]);


    const { error: error3 } = await supabase
      .from("Team_Member")
      .delete()
      .eq("team_id", user_id[0].Company.temporary_team)
      .eq("user_id", user_id[0].id)


    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Remove team members to a team 
module.exports.removeTeamMember = async (req, res) => {
  const { team_id, team_member } = req.body;

  try {

    const { data: user_id, error: getUserIdError } = await supabase
      .from("User")
      .select(`
         id,
         Company(temporary_team)
    `)
      .eq("email", team_member);


    const { error: removeTeamMemberError } = await supabase
      .from("Team_Member")
      .delete()
      .eq('user_id', user_id[0].id)
      .eq('team_id', team_id)


    const { data, error, count } = await supabase
      .from("Team_Member")
      .select('*', { count: 'exact' })
      .eq('user_id', user_id[0].id);


    if (count == 0) {
      const { error: addToTempTeamError } = await supabase
        .from("Team_Member")
        .insert([
          { "user_id": user_id[0].id, "team_id": user_id[0].Company.temporary_team },
        ]);
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Get the team dashboard data
module.exports.getTeamDashboardData = async (req, res) => {
  const { team_id } = req.body;

  try {
    const { data: team, error: getTeamError } = await supabase
      .from("Team")
      .select(`
        id,
        name, 
        divisions, 
        wao_days,
        team_created, 
        Company!Team_company_id_fkey (*),
        User(email)
      `)
      .eq("id", team_id);


    const teamInfo = {
      id: team[0].id,
      name: team[0].name,
      email: team[0].User.email,
      company: team[0].Company.name,
      divisions: team[0].divisions,
      wao_days: team[0].wao_days,
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
    res.status(500).json({ status: "error" });
  }
};

