const { Router } = require("express");

const {
  postCarbonFootprint,
  getCarbonFootprint,
  resetCarbonFootprint,
  editCompanyCarbonStandard,
  getCompanyCarbonStandard,
  getTransportMode
} = require("../controllers/CarbonFootprintControllers");

const router = Router();

//to add their carbon footprint stats for their week
router.post("/postCarbonFootprint", postCarbonFootprint);

//to add their carbon footprint stats for their week
router.post("/getCarbonFootprint", getCarbonFootprint);

//to reset their carbon footprint stats for their week
router.post("/resetCarbonFootprint", resetCarbonFootprint);

//to edit companies carbon footprint standards
router.post("/editCompanyCarbonStandard", editCompanyCarbonStandard);

//get company carbon footprint standards
router.post("/getCompanyCarbonStandard", getCompanyCarbonStandard);

//get users transport mode in a 5-sec intervals
router.post("/getTransportMode", getTransportMode);

module.exports = router;