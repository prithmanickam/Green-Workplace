const { Router } = require("express");

const {
  loginUser,
  getUserData,
  sendRegistrationEmails,
  getEmailFromToken,
  registerUser,
  getAllUsers,
  getAllNonTeamOwners,
} = require("../controllers/AuthControllers");

const {
  postCarbonFootprint,
  resetCarbonFootprint
} = require("../controllers/CarbonFootprintControllers");

const {
  addTeam,
  getTeams,
} = require("../controllers/TeamControllers");

const router = Router();

router.post("/login", loginUser);
router.post("/userData", getUserData);

//for admin to send registration link
router.post("/sendRegistrationEmails", sendRegistrationEmails);

//for user to retrive email from their registration url link
router.post("/getEmail", getEmailFromToken);

//to create an account and add the user to the database
router.post("/register", registerUser);

//to add their carbon footprint stats for their week
router.post("/postCarbonFootprint", postCarbonFootprint);

//to reset their carbon footprint stats for their week
router.post("/resetCarbonFootprint", resetCarbonFootprint);

//to retrive all users that are not admins 
router.post("/getAllUsers", getAllUsers);

//to retrive all users that are not admins or team owners
router.post("/getAllNonTeamOwners", getAllNonTeamOwners);

//to add teams to the database
router.post("/addTeam", addTeam);

//to get all teams from the database
router.post("/getTeams", getTeams);

module.exports = router;