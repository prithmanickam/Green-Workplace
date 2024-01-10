const { Router } = require("express");

const {
  loginUser,
  getUserData,
  sendRegistrationEmails,
  sendResetPasswordEmail,
  getEmailFromToken,
  registerUser,
  getAllUsers,
  updateUsername,
  updatePassword,
} = require("../controllers/AuthControllers");

const router = Router();

router.post("/login", loginUser);

router.post("/userData", getUserData);

//for admin to send registration link
router.post("/sendRegistrationEmails", sendRegistrationEmails);

//sends reset password link
router.post("/sendResetPasswordEmail", sendResetPasswordEmail);

//for user to retrive email from their registration url link
router.post("/getEmail", getEmailFromToken);

//to create an account and add the user to the database
router.post("/register", registerUser);

//to retrive all users that are not admins in that company
router.post("/getAllUsers", getAllUsers);

//to update firstname and lastname of user
router.post("/updateUsername", updateUsername);

//to update firstname and lastname of user
router.post("/updatePassword", updatePassword);

module.exports = router;