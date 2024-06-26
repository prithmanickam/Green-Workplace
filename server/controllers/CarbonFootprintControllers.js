const supabase = require("../config/supabaseConfig");
const { RandomForestClassifier } = require('ml-random-forest');
const { Matrix } = require('ml-matrix');
const { readFileSync } = require('fs');
const path = require('path');

const schedule = require('node-schedule');

const job = schedule.scheduleJob('55 23 * * 0', async function () {
  try {
    console.log('Executing the scheduled task every Sunday at evening');

    // Fetch data from Team_Member
    const { data: usersTeams } = await supabase
      .from("Team_Member")
      .select(`team_id, user_id, monday_cf, tuesday_cf, wednesday_cf, thursday_cf, friday_cf, Team(company_id)`);

    // Calculate the date of the last Monday
    const lastMonday = new Date();
    lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay() + 6) % 7);

    const day = String(lastMonday.getDate()).padStart(2, '0');
    const month = String(lastMonday.getMonth() + 1).padStart(2, '0');
    const year = lastMonday.getFullYear().toString().substr(-2);
    const formattedDate = `${day}-${month}-${year}`;

    // For each user-team pair insert into Team_Member_History table
    for (const entry of usersTeams) {
      const totalCarbonFootprint = entry.monday_cf + entry.tuesday_cf + entry.wednesday_cf + entry.thursday_cf + entry.friday_cf;

      await supabase
        .from("Team_Member_History")
        .insert([
          {
            user_id: entry.user_id,
            team_id: entry.team_id,
            week: formattedDate,
            carbon_footprint: totalCarbonFootprint,
            company_id: entry.Team.company_id,
          }
        ]);

    }
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});


const modelPath = path.join(__dirname, '..', 'machine_learning', 'model.json');

// Load the model and targetMap 
const loadModel = (filePath) => {
  const data = readFileSync(filePath, 'utf8');
  const modelState = JSON.parse(data);
  const classifier = RandomForestClassifier.load(modelState.model);
  return {
    classifier: classifier,
    targetMap: modelState.targetMap
  };
};

const { classifier, targetMap } = loadModel(modelPath);

module.exports.getTransportMode = async (req, res) => {
  try {
    const { newData } = req.body;
    
    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ status: "error", message: "No data provided." });
    }

    const input = new Matrix([Object.values(newData)]);
    const prediction = classifier.predict(input);

    // Find the mode from the targetMap using the prediction
    const mode = Object.keys(targetMap).find(key => targetMap[key] === prediction[0]);

    res.status(200).json({ status: "ok", mode });
  } catch (error) {
    res.status(500).json({ status: "error", errorMsg: error, message: "An error occurred on the server." });
  }
};

module.exports.postCarbonFootprint = async (req, res) => {
  const { user_id, day, duration, teamData } = req.body;

  try {
    const tableName = `User_${day}_Duration`;

    await supabase.from(tableName).upsert([
      {
        user_id,
        duration,
      },
    ], { onConflict: "user_id" }
    );

    for (const teamInfo of teamData) {
      const { team_id, calculatedCarbonFootprint } = teamInfo;

      const dayColumnName = day.toLowerCase() + '_cf';

      await supabase
        .from("Team_Member")
        .update(
          {
            [dayColumnName]: calculatedCarbonFootprint,
          },
        ).eq("user_id", user_id).eq("team_id", team_id);

    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
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
    const { data: user_teams } = await supabase
      .from("Team_Member")
      .select("team_id")
      .eq("user_id", user_id);

    const { data: userDuration } = await supabase
      .from("User")
      .select(`User_Monday_Duration(duration), User_Tuesday_Duration(duration), User_Wednesday_Duration(duration), User_Thursday_Duration(duration), User_Friday_Duration(duration)`)
      .eq('id', user_id);

    totalStats["Monday"]["duration"] = `${userDuration[0].User_Monday_Duration ? userDuration[0].User_Monday_Duration.duration : `0 min`}`;
    totalStats["Tuesday"]["duration"] = `${userDuration[0].User_Tuesday_Duration ? userDuration[0].User_Tuesday_Duration.duration : `0 min`}`;
    totalStats["Wednesday"]["duration"] = `${userDuration[0].User_Wednesday_Duration ? userDuration[0].User_Wednesday_Duration.duration : `0 min`}`;
    totalStats["Thursday"]["duration"] = `${userDuration[0].User_Thursday_Duration ? userDuration[0].User_Thursday_Duration.duration : `0 min`}`;
    totalStats["Friday"]["duration"] = `${userDuration[0].User_Friday_Duration ? userDuration[0].User_Friday_Duration.duration : `0 min`}`;

    for (const team of user_teams) {
      const { data: teamInfo } = await supabase
        .from("Team_Member")
        .select(`monday_cf, tuesday_cf, wednesday_cf, thursday_cf, friday_cf, Team(name)`)
        .eq("team_id", team.team_id)
        .eq("user_id", user_id)

      if (teamInfo[0].monday_cf) {
        stats.Monday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].monday_cf + 'kg CO2e'));
        totalStats["Monday"]["carbon_footprint"] += teamInfo[0].monday_cf;
      } else {
        stats.Monday.push(teamInfo[0].Team.name + ': ' + "0kg CO2e")
      }

      if (teamInfo[0].tuesday_cf) {
        stats.Tuesday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].tuesday_cf + 'kg CO2e'));
        totalStats["Tuesday"]["carbon_footprint"] += teamInfo[0].tuesday_cf;
      } else {
        stats.Tuesday.push(teamInfo[0].Team.name + ': ' + "0kg CO2e")
      }

      if (teamInfo[0].wednesday_cf) {
        stats.Wednesday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].wednesday_cf + 'kg CO2e'));
        totalStats["Wednesday"]["carbon_footprint"] += teamInfo[0].wednesday_cf;
      } else {
        stats.Wednesday.push(teamInfo[0].Team.name + ': ' + "0kg CO2e")
      }

      if (teamInfo[0].thursday_cf) {
        stats.Thursday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].thursday_cf + 'kg CO2e'));
        totalStats["Thursday"]["carbon_footprint"] += teamInfo[0].thursday_cf;
      } else {
        stats.Thursday.push(teamInfo[0].Team.name + ': ' + "0kg CO2e")
      }

      if (teamInfo[0].friday_cf) {
        stats.Friday.push(teamInfo[0].Team.name + ': ' + (teamInfo[0].friday_cf + 'kg CO2e'));
        totalStats["Friday"]["carbon_footprint"] += teamInfo[0].friday_cf;
      } else {
        stats.Friday.push(teamInfo[0].Team.name + ': ' + "0kg CO2e")
      }
    }

    totalStats.Monday.carbon_footprint = totalStats.Monday.carbon_footprint.toFixed(2)
    totalStats.Tuesday.carbon_footprint = totalStats.Tuesday.carbon_footprint.toFixed(2)
    totalStats.Wednesday.carbon_footprint = totalStats.Wednesday.carbon_footprint.toFixed(2)
    totalStats.Thursday.carbon_footprint = totalStats.Thursday.carbon_footprint.toFixed(2)
    totalStats.Friday.carbon_footprint = totalStats.Friday.carbon_footprint.toFixed(2)

    res.status(200).json({ status: "ok", stats, totalStats });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};

module.exports.resetCarbonFootprint = async (req, res) => {
  const { day, user_id } = req.body;

  try {
    const tableName = `User_${day}_Duration`;
    const dayColumnName = day.toLowerCase() + '_cf';

    await supabase
      .from("Team_Member")
      .update(
        {
          [dayColumnName]: 0,
        },
      ).eq("user_id", user_id);

    await supabase
      .from(tableName)
      .delete()
      .eq("user_id", user_id);

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};

// Edit company carbon footprint standards as an admin
module.exports.editCompanyCarbonStandard = async (req, res) => {
  const { company_id, greenStandard, amberStandard, redStandard } = req.body;

  try {

    await supabase
      .from("Company")
      .update({
        "green_carbon_standard": greenStandard,
        "amber_carbon_standard": amberStandard,
        "red_carbon_standard": redStandard,
      })
      .eq("id", company_id);

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// get company carbon footprint standards
module.exports.getCompanyCarbonStandard = async (req, res) => {
  const { company_id } = req.body;

  try {

    const { data: companyStandard } = await supabase
      .from("Company")
      .select("green_carbon_standard, amber_carbon_standard, red_carbon_standard")
      .eq("id", company_id);

    const companyCarbonStandard = companyStandard[0]

    res.status(200).json({ status: "ok", companyCarbonStandard });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};