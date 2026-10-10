const { Op } = require("sequelize");
const { Room, Booking } = require("../models");
const { ACTIVE_BOOKING_STATUSES } = require("./availability.service");
const {
  SLOTS_BY_DURATION,
  CLEANING_BUFFER_HOURS,
  HOUR_MS,
  buildSlotRange,
  overlapsWithBuffer,
} = require("../config/bookingSlots");

async function getSlots({ date, durationHours }) {
  const times = SLOTS_BY_DURATION[durationHours];
  const slots = times.map((time) => ({
    time,
    ...buildSlotRange(date, time, durationHours),
  }));

  const windowStart = new Date(
    Math.min(...slots.map((s) => s.checkIn.getTime())),
  );
  const windowEnd = new Date(
    Math.max(...slots.map((s) => s.checkOut.getTime())),
  );
  const bufferMs = CLEANING_BUFFER_HOURS * HOUR_MS;

  const rooms = await Room.findAll({
    where: { is_active: true },
    order: [["name", "ASC"]],
  });

  const bookings = await Booking.findAll({
    where: {
      status: { [Op.in]: ACTIVE_BOOKING_STATUSES },
      check_in: { [Op.lt]: new Date(windowEnd.getTime() + bufferMs) },
      check_out: { [Op.gt]: new Date(windowStart.getTime() - bufferMs) },
    },
    attributes: ["room_id", "check_in", "check_out"],
  });

  const now = new Date();

  return rooms.map((room) => {
    const roomBookings = bookings.filter((b) => b.room_id === room.id);
    return {
      roomId: room.id,
      roomName: room.name,
      slots: slots.map((slot) => {
        const blocked = roomBookings.some((b) =>
          overlapsWithBuffer(
            b.check_in,
            b.check_out,
            slot.checkIn,
            slot.checkOut,
          ),
        );
        return {
          startTime: slot.time,
          checkIn: slot.checkIn,
          checkOut: slot.checkOut,
          available: !blocked && slot.checkIn > now,
        };
      }),
    };
  });
}

module.exports = { getSlots };
