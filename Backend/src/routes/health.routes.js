const express = require("express");
const sequelize = require("../config/database");

const router = express.Router();

// Liveness: "is the process running?" Cheap, no database call.
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Readiness: "can the app actually reach the database?"
router.get("/db", async (req, res, next) => {
  try {
    await sequelize.query("SELECT 1");
    res.json({ success: true, data: { database: "connected" } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
