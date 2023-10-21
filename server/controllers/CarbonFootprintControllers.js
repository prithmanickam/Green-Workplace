const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Team = require("../models/TeamModel");

const supabase = require("../config/supabaseConfig");

module.exports.postCarbonFootprint = async (req, res) => {
  const { user_id, day, duration, carbonFootprint, teamData } = req.body; //teamData has team_id and carbon stats

  try {
    const tableName = `User_${day}_Stats`;

    const { error: userCFError } = await supabase.from(tableName).upsert([
      {
        user_id,
        carbon_footprint: carbonFootprint,
        duration,
      },
    ], { onConflict: "user_id" }
    );

    if (userCFError) {
      console.error("Error adding user carbon footprint:", userCFError);
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
        console.error("Error adding team carbon footprint:", teamCFError);
        return res.status(500).json({ status: "error" });
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
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
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  };

  try {
    // find teams user us in
    const { data: user_teams, getUserTeamsError } = await supabase
      .from("Team_Member")
      .select("team_id")
      .eq("user_id", user_id);

    if (getUserTeamsError) {
      console.error("Error finding user teams:", getUserTeamsError);
      return res.status(500).json({ status: "error" });
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (const day of days) {
      const tableName = `User_${day}_Stats`;

      const { data, error } = await supabase
        .from(tableName)
        .select('duration, carbon_footprint')
        .eq('user_id', user_id);

      if (data && data.length > 0) {
        const { carbon_footprint, duration } = data[0];

        totalStats[day].push(`Duration: ${duration}`);
        totalStats[day].push(`Carbon Footprint: ${carbon_footprint}kg CO2`);
      } else {
        totalStats[day].push(`Duration: 0 min`);
        totalStats[day].push(`Carbon Footprint: 0kg CO2`);
      }
    }

    for (const team of user_teams) {
      const { data: teamDays, getTeamDaysError } = await supabase
        .from("Team_Member")
        .select("monday_cf, tuesday_cf, wednesday_cf, thursday_cf, friday_cf")
        .eq("team_id", team.team_id)
        .eq("user_id", user_id)

      if (getTeamDaysError) {
        console.error("Error finding team name:", getTeamDaysError);
        return res.status(500).json({ status: "error" });
      }

      const { data: team_name, getTeamNameError } = await supabase
        .from("Team")
        .select("name")
        .eq("id", team.team_id);

      if (getTeamNameError) {
        console.error("Error finding team name:", getTeamNameError);
        return res.status(500).json({ status: "error" });
      }

      stats.Monday.push(team_name[0].name + ': ' + (teamDays[0].monday_cf ? teamDays[0].monday_cf + 'kg CO2' : '0kg CO2'));
      stats.Tuesday.push(team_name[0].name + ': ' + (teamDays[0].tuesday_cf ? teamDays[0].tuesday_cf + 'kg CO2' : '0kg CO2'));
      stats.Wednesday.push(team_name[0].name + ': ' + (teamDays[0].wednesday_cf ? teamDays[0].wednesday_cf + 'kg CO2' : '0kg CO2'));
      stats.Thursday.push(team_name[0].name + ': ' + (teamDays[0].thursday_cf ? teamDays[0].thursday_cf + 'kg CO2' : '0kg CO2'));
      stats.Friday.push(team_name[0].name + ': ' + (teamDays[0].friday_cf ? teamDays[0].friday_cf + 'kg CO2' : '0kg CO2'));
    }

    res.status(200).json({ status: "ok", stats, totalStats });
  } catch (error) {
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
      console.error("Error adding team carbon footprint:", teamCFError);
      return res.status(500).json({ status: "error" });
    }

    const { error: userCFError } = await supabase
      .from(tableName)
      .delete()
      .eq("user_id", user_id);

    if (userCFError) {
      console.error("Error adding user carbon footprint:", userCFError);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
    //console.error(error);
  }
};