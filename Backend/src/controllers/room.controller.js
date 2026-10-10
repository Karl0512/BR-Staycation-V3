const roomService = require("../services/room.service");

async function list(req, res, next) {
  try {
    const rooms = await roomService.listActive();
    res.status(200).json({ success: true, data: { rooms } });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
