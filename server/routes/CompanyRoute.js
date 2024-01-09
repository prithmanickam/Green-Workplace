const { Router } = require("express");

const {
    getOffices,
    addOffice,
    deleteOffice,
    updateEmployeeOffice,
    deleteEmployee,
    getCompanyDashboardData,
    getLineChartData,
    getBarChartData,
} = require("../controllers/CompanyControllers");

const router = Router();

//to get the offices from the database
router.post("/getOffices", getOffices);

//to get the offices from the database
router.post("/addOffice", addOffice);

//to get the offices from the database
router.post("/deleteOffice", deleteOffice);

//to get the offices from the database
router.post("/updateEmployeeOffice", updateEmployeeOffice);

//to get the offices from the database
router.post("/deleteEmployee", deleteEmployee);

//to get the users company dashboard data from the database
router.post("/getCompanyDashboardData", getCompanyDashboardData);

//to get the line chart data from the database
router.post("/getLineChartData", getLineChartData);

//to get the bar chart data from the database
router.post("/getBarChartData", getBarChartData);

module.exports = router;