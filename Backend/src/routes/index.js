const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const roomRoutes = require("./room.routes");
const ratePlanRoutes = require("./ratePlan.routes");
const availabilityRoutes = require("./availability.routes");
const bookingRoutes = require("./booking.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/rate-plans", ratePlanRoutes);
router.use("/availability", availabilityRoutes);
router.use("/bookings", bookingRoutes);

module.exports = router;
