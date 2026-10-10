const express = require("express");
const bookingController = require("../controllers/booking.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, bookingController.create);

module.exports = router;
