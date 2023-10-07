const { Router } = require("express");

const {
    addTeam,
    getTeams,
    deleteTeam,
} = require("../controllers/TeamControllers");

const router = Router();

//to add teams to the database
router.post("/addTeam", addTeam);

//to get all teams from the database
router.get("/getTeams", getTeams);

//to delete a team from the database
router.post("/deleteTeam", deleteTeam);

module.exports = router;