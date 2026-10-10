const { Op } = require("sequelize");
const { Room, Booking } = require("../models");

// Mirrors the DB exclusion constraint (blocks every status EXCEPT cancelled/expired).
const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "completed"];

async function getAvailability({ from, to }) {
  const rooms = await Room.findAll({
    where: { is_active: true },
    order: [["name", "ASC"]],
  });

  const bookings = await Booking.findAll({
    where: {
      status: { [Op.in]: ACTIVE_BOOKING_STATUSES },
      check_in: { [Op.lt]: to },
      check_out: { [Op.gt]: from },
    },
    attributes: ["room_id", "check_in", "check_out"],
  });

  return rooms.map((room) => ({
    roomId: room.id,
    roomName: room.name,
    bookedRanges: bookings
      .filter((b) => b.room_id === room.id)
      .map((b) => ({ checkIn: b.check_in, checkOut: b.check_out })),
  }));
}

module.exports = { getAvailability, ACTIVE_BOOKING_STATUSES };
