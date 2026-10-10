const { RatePlan } = require("../models");

async function listActive() {
  return RatePlan.findAll({
    where: { is_active: true },
    order: [["duration_hours", "ASC"]],
  });
}

module.exports = { listActive };
