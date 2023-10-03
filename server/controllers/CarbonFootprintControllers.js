const User = require("../models/UserModel");

module.exports.postCarbonFootprint = async (req, res) => {
    const { email, day, duration, carbonFootprint } = req.body;

    try {
        const user = await User.findOne({ email });

        // Update the 'duration' and 'carbon' for the specified day in 'currentWeekStats'
        user.currentWeekStats[day]["duration"] = duration;
        user.currentWeekStats[day]["carbon"] = carbonFootprint;

        await user.save();

        res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error(error);
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

        await user.save();

        res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error" });
    }
};