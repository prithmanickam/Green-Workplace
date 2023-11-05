const { Router } = require("express");

const {
    addTeam,
    getTeams,
    deleteTeam,
    getUserTeamsData,
    getOffices,
    getYourDashboardData,
    postWorkAtOfficePreference,
    getUserTeams,
    getTeamDashboardData,
    getCompanyDashboardData,
    getUserTeamOwnerTeams,
    getTeamOwnerFunctionsData,
    editTeamName,
    editTeamWAODays,
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

//to get the offices from the database
router.post("/getUserTeams", getUserTeams);

//to get the offices from the database
router.post("/getUserTeamOwnerTeams", getUserTeamOwnerTeams);

//to get the users team dashboard data from the database
router.post("/getTeamOwnerFunctionsData", getTeamOwnerFunctionsData);

//to edit team name the offices from the database
router.post("/editTeamName", editTeamName);

//to edit team WAO days
router.post("/editTeamWAODays", editTeamWAODays);

//to get the users team dashboard data from the database
router.post("/getTeamDashboardData", getTeamDashboardData);

//to get the users company dashboard data from the database
router.post("/getCompanyDashboardData", getCompanyDashboardData);

module.exports = router;