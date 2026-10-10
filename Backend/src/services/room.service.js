const { Room } = require("../models");

async function listActive() {
  return Room.findAll({
    where: { is_active: true },
    order: [["name", "ASC"]],
  });
}

module.exports = { listActive };
