const ratePlanService = require("../services/ratePlan.service");

async function list(req, res, next) {
  try {
    const ratePlans = await ratePlanService.listActive();
    res.status(200).json({ success: true, data: { ratePlans } });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
