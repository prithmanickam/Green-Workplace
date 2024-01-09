const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/AuthRoute");
app.use("/api", authRoutes);

const carbonFootprintRoutes = require("./routes/CarbonFootprintRoute");
app.use("/api", carbonFootprintRoutes);

const teamRoutes = require("./routes/TeamRoute");
app.use("/api", teamRoutes);

const companyRoutes = require("./routes/CompanyRoute");
app.use("/api", companyRoutes);

module.exports = app;