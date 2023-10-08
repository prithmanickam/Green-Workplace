const { Router } = require("express");

const {
  postCarbonFootprint,
  getCarbonFootprint,
  resetCarbonFootprint
} = require("../controllers/CarbonFootprintControllers");

const router = Router();

//to add their carbon footprint stats for their week
router.post("/postCarbonFootprint", postCarbonFootprint);

//to add their carbon footprint stats for their week
router.post("/getCarbonFootprint", getCarbonFootprint);

//to reset their carbon footprint stats for their week
router.post("/resetCarbonFootprint", resetCarbonFootprint);


module.exports = router;