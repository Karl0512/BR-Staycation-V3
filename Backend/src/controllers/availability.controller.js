const availabilityService = require("../services/availability.service");
const slotsService = require("../services/slots.service");
const {
  availabilityQuerySchema,
  slotsQuerySchema,
} = require("../validators/availability.validator");

async function get(req, res, next) {
  try {
    const { from, to } = availabilityQuerySchema.parse(req.query);
    const rooms = await availabilityService.getAvailability({ from, to });
    res.status(200).json({ success: true, data: { from, to, rooms } });
  } catch (err) {
    next(err);
  }
}

async function getSlots(req, res, next) {
  try {
    const { date, durationHours } = slotsQuerySchema.parse(req.query);
    const rooms = await slotsService.getSlots({ date, durationHours });
    res
      .status(200)
      .json({ success: true, data: { date, durationHours, rooms } });
  } catch (err) {
    next(err);
  }
}

module.exports = { get, getSlots };
