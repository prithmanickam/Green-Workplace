const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Team = require("../models/TeamModel");

module.exports.postCarbonFootprint = async (req, res) => {
    const { email, day, duration, carbonFootprint, teamData } = req.body;

    try {
        const user = await User.findOne({ email });

        // Update the 'duration' and 'carbon' for the specified day in 'currentWeekStats'
        user.currentWeekStats[day]["duration"] = duration;
        user.currentWeekStats[day]["carbon"] = carbonFootprint;

        // Iterate through teamData (allocated carbon footprint values) and update dayStats for each team
        for (const teamInfo of teamData) {
            const { team_id, calculatedCarbonFootprint } = teamInfo;

            // Find the team in the user's teams array
            const teamIndex = user.teams.findIndex((team) => team._id.toString() === team_id);

            if (teamIndex !== -1) {
                // Update the dayStats for the specified day for this team
                user.teams[teamIndex].dayStats[day] = calculatedCarbonFootprint;

                teamDayStats = user.teams[teamIndex].dayStats;

                let sum = 0;
                for (const day in teamDayStats) {
                    if (teamDayStats.hasOwnProperty(day)) {
                        const value = teamDayStats[day];
                        if (typeof value === 'number') {
                            sum += value;
                        }
                    }
                }

                user.teams[teamIndex].carbonFootprint = sum.toFixed(2)
            }
        }

        await user.save();

        res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error" });

    }
};

module.exports.getCarbonFootprint = async (req, res) => {
    const { email } = req.body;

    try {

        const user = await User.findOne({ email });

        // To help display the allocated carbon footprint value for users teams
        const stats = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: []
        };

        for (const team of user.teams) {
            const teamInfo = await Team.findById(team._id);
            const teamName = teamInfo.teamName;

            stats.Monday.push(teamName + ': ' + (team.dayStats.Monday ? team.dayStats.Monday.toFixed(2) + 'kg CO2' : '0kg CO2'));
            stats.Tuesday.push(teamName + ': ' + (team.dayStats.Tuesday ? team.dayStats.Tuesday.toFixed(2) + 'kg CO2' : '0kg CO2'));
            stats.Wednesday.push(teamName + ': ' + (team.dayStats.Wednesday ? team.dayStats.Wednesday.toFixed(2) + 'kg CO2' : '0kg CO2'));
            stats.Thursday.push(teamName + ': ' + (team.dayStats.Thursday ? team.dayStats.Thursday.toFixed(2) + 'kg CO2' : '0kg CO2'));
            stats.Friday.push(teamName + ': ' + (team.dayStats.Friday ? team.dayStats.Friday.toFixed(2) + 'kg CO2' : '0kg CO2'));
        }

        res.status(200).json({ status: "ok", data: stats });
    } catch (error) {
        res.status(500).json({ status: "error" });
    }
};

module.exports.resetCarbonFootprint = async (req, res) => {
    const { day, email } = req.body;

    try {
        const user = await User.findOne({ email });

        // reset 'duration' and 'carbon' for the specified day 
        user.currentWeekStats[day]["duration"] = "0 min";
        user.currentWeekStats[day]["carbon"] = 0;

        // reset the users carbon footprint for all their teams on the specified day 
        for (const team of user.teams) {
            team.dayStats[day] = 0;
        }

        await user.save();

        res.status(200).json({ status: "ok" });
    } catch (error) {
        res.status(500).json({ status: "error" });
        //console.error(error);
    }
};