const supabase = require("../config/supabaseConfig");

module.exports.postCarbonFootprint = async (req, res) => {
  const { user_id, day, duration, carbonFootprint, teamData } = req.body; //teamData has team_id and carbon stats

  try {
    const tableName = `User_${day}_Stats`;

    const { error: userCFError } = await supabase.from(tableName).upsert([
      {
        user_id,
        duration,
      },
    ], { onConflict: "user_id" }
    );

    if (userCFError) {
      //console.error("Error adding user carbon footprint:", userCFError);
      return res.status(500).json({ status: "error" });
    }

    for (const teamInfo of teamData) {
      const { team_id, calculatedCarbonFootprint } = teamInfo;

      const dayColumnName = day.toLowerCase() + '_cf';

      const { error: teamCFError } = await supabase
        .from("Team_Member")
        .update(
          {
            [dayColumnName]: calculatedCarbonFootprint,
          },
        ).eq("user_id", user_id).eq("team_id", team_id);

      if (teamCFError) {
        //console.error("Error adding team carbon footprint:", teamCFError);
        return res.status(500).json({ status: "error" });
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });

  }
};

module.exports.getCarbonFootprint = async (req, res) => {

  const { user_id } = req.body;

  const stats = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  };

  const totalStats = {
    Monday: {
      duration: `Duration: 0 min`,
      carbon_footprint: 0,
    },
    Tuesday: {
      duration: `Duration: 0 min`,
      carbon_footprint: 0,
    },
    Wednesday: {
      duration: `Duration: 0 min`,
      carbon_footprint: 0,
    },
    Thursday: {
      duration: `Duration: 0 min`,
      carbon_footprint: 0,
    },
    Friday: {
      duration: `Duration: 0 min`,
      carbon_footprint: 0,
    }
  };

  try {
    // find teams user us in
    const { data: user_teams, error:getUserTeamsError } = await supabase
      .from("Team_Member")
      .select("team_id")
      .eq("user_id", user_id);

    if (getUserTeamsError) {
      //console.error("Error finding user teams:", getUserTeamsError);
      return res.status(500).json({ status: "error" });
    }

    const { data:userDuration, error:getUserDurationError } = await supabase
      .from("User")
      .select(`User_Monday_Stats(duration), User_Tuesday_Stats(duration), User_Wednesday_Stats(duration), User_Thursday_Stats(duration), User_Friday_Stats(duration)`)
      .eq('id', user_id);

    if (getUserDurationError) {
      console.error("Error finding user teams:", getUserDurationError);
      return res.status(500).json({ status: "error" });
    }

    totalStats["Monday"]["duration"] = `${userDuration[0].User_Monday_Stats ? userDuration[0].User_Monday_Stats.duration : `0 min`}`;
    totalStats["Tuesday"]["duration"] = `${userDuration[0].User_Tuesday_Stats ? userDuration[0].User_Tuesday_Stats.duration : `0 min`}`;
    totalStats["Wednesday"]["duration"] = `${userDuration[0].User_Wednesday_Stats ? userDuration[0].User_Wednesday_Stats.duration : `0 min`}`;
    totalStats["Thursday"]["duration"] = `${userDuration[0].User_Thursday_Stats ? userDuration[0].User_Thursday_Stats.duration : `0 min`}`;
    totalStats["Friday"]["duration"] = `${userDuration[0].User_Friday_Stats ? userDuration[0].User_Friday_Stats.duration : `0 min`}`;

    for (const team of user_teams) { 
      const { data: teamInfo, getTeamInfoError } = await supabase
        .from("Team_Member")
        .select(`monday_cf, tuesday_cf, wednesday_cf, thursday_cf, friday_cf, Team(name)`)
        .eq("team_id", team.team_id)
        .eq("user_id", user_id)

      if (getTeamInfoError) {
        console.error("Error finding team mem days cf:", getTeamInfoError);
        return res.status(500).json({ status: "error" });
      }
      
      if (teamInfo[0].monday_cf){
        stats.Monday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].monday_cf + 'kg CO2'));
        totalStats["Monday"]["carbon_footprint"] += teamInfo[0].monday_cf;
      }
      if (teamInfo[0].tuesday_cf){
        stats.Tuesday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].tuesday_cf + 'kg CO2'));
        totalStats["Tuesday"]["carbon_footprint"] += teamInfo[0].tuesday_cf;
      }
      if (teamInfo[0].wednesday_cf){
        stats.Wednesday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].wednesday_cf + 'kg CO2'));
        totalStats["Wednesday"]["carbon_footprint"] += teamInfo[0].wednesday_cf;
      }
      if (teamInfo[0].thursday_cf){
        stats.Thursday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].thursday_cf + 'kg CO2'));
        totalStats["Thursday"]["carbon_footprint"] += teamInfo[0].thursday_cf;
      }
      if (teamInfo[0].friday_cf){
        stats.Friday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].friday_cf + 'kg CO2'));
        totalStats["Friday"]["carbon_footprint"] += teamInfo[0].friday_cf;
      }
    }

    res.status(200).json({ status: "ok", stats, totalStats });
  } catch (error) {
    //console.log(error)
    res.status(500).json({ status: "error" });
  }
};

module.exports.resetCarbonFootprint = async (req, res) => {
  const { day, user_id } = req.body;

  try {
    const tableName = `User_${day}_Stats`;
    const dayColumnName = day.toLowerCase() + '_cf';

    const { error: teamCFError } = await supabase
      .from("Team_Member")
      .update(
        {
          [dayColumnName]: 0,
        },
      ).eq("user_id", user_id);

    if (teamCFError) {
      //console.error("Error adding team carbon footprint:", teamCFError);
      return res.status(500).json({ status: "error" });
    }

    const { error: userCFError } = await supabase
      .from(tableName)
      .delete()
      .eq("user_id", user_id);

    if (userCFError) {
      //console.error("Error adding user carbon footprint:", userCFError);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
    //console.error(error);
  }
};