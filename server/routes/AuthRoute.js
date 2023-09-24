const { Router } = require("express");

const {
  loginUser,
  getUserData,
} = require("../controllers/AuthControllers");

const router = Router();

router.post("/login", loginUser);
router.post("/userData", getUserData);

module.exports = router;