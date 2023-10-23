const { Router } = require("express");

const {
    addTeam,
    getTeams,
    deleteTeam,
    getUserTeamsData,
    getOffices,
    getYourDashboardData,
    postWorkAtOfficePreference
} = require("../controllers/TeamControllers");

const router = Router();

//to add teams to the database
router.post("/addTeam", addTeam);

//to get all teams from the database
router.post("/getTeams", getTeams);

//to delete a team from the database
router.post("/deleteTeam", deleteTeam);

//to get the users teams data from the database
router.post("/getUserTeamsData", getUserTeamsData);

//to get the offices from the database
router.post("/getOffices", getOffices);

//to get the users dashboard data including info on their teams from the database
router.post("/getYourDashboardData", getYourDashboardData);

//post users work at office preference to a specific team
router.post("/postWorkAtOfficePreference", postWorkAtOfficePreference);

module.exports = router;