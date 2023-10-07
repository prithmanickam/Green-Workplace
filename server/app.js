const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

const authRoutes = require("./routes/AuthRoute");
app.use("/api", authRoutes);

const carbonFootprintRoutes = require("./routes/CarbonFootprintRoute");
app.use("/api", carbonFootprintRoutes);

const teamRoutes = require("./routes/TeamRoute");
app.use("/api", teamRoutes);

module.exports = app;