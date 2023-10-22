const { Router } = require("express");

const {
  loginUser,
  getUserData,
  sendRegistrationEmails,
  getEmailFromToken,
  registerUser,
  getAllUsers,
} = require("../controllers/AuthControllers");

const router = Router();

router.post("/login", loginUser);
router.post("/userData", getUserData);

//for admin to send registration link
router.post("/sendRegistrationEmails", sendRegistrationEmails);

//for user to retrive email from their registration url link
router.post("/getEmail", getEmailFromToken);

//to create an account and add the user to the database
router.post("/register", registerUser);

//to retrive all users that are not admins in that company
router.post("/getAllUsers", getAllUsers);

module.exports = router;