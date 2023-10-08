const { Router } = require("express");

const {
    addTeam,
    getTeams,
    deleteTeam,
    getUserTeamsData,
} = require("../controllers/TeamControllers");

const router = Router();

//to add teams to the database
router.post("/addTeam", addTeam);

//to get all teams from the database
router.get("/getTeams", getTeams);

//to delete a team from the database
router.post("/deleteTeam", deleteTeam);

//to get the users teams data from the database
router.post("/getUserTeamsData", getUserTeamsData);

module.exports = router;