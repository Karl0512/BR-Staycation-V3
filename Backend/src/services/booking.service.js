const {
  Op,
  UniqueConstraintError,
  ExclusionConstraintError,
} = require("sequelize");
const { sequelize, Room, RatePlan, Booking } = require("../models");
const AppError = require("../utils/AppError");
const { calculateTotal } = require("../utils/pricing");
const { ACTIVE_BOOKING_STATUSES } = require("./availability.service");
const {
  SLOTS_BY_DURATION,
  CLEANING_BUFFER_HOURS,
  HOLD_MINUTES,
  HOUR_MS,
  buildSlotRange,
  overlapsWithBuffer,
} = require("../config/bookingSlots");

const MINUTE_MS = 60 * 1000;

function findByKey(key) {
  return Booking.findOne({ where: { idempotency_key: key } });
}

// Same key + same user = retry: return the original booking.
// Same key + different user = refuse without revealing anything.
function replay(existing, user) {
  if (existing.user_id !== user.id) {
    throw new AppError(
      "This idempotency key is already in use.",
      409,
      "IDEMPOTENCY_KEY_CONFLICT",
    );
  }
  return { booking: existing, replayed: true };
}

async function createBooking({ user, idempotencyKey, input }) {
  const {
    roomId,
    date,
    durationHours,
    startTime,
    guestCount,
    specialRequests,
  } = input;

  const allowedTimes = SLOTS_BY_DURATION[durationHours];
  if (!allowedTimes.includes(startTime)) {
    throw new AppError(
      `Start time must be one of: ${allowedTimes.join(", ")} for a ${durationHours}-hour booking.`,
      400,
      "INVALID_SLOT",
    );
  }

  const existing = await findByKey(idempotencyKey);
  if (existing) return replay(existing, user);

  const { checkIn, checkOut } = buildSlotRange(date, startTime, durationHours);
  if (checkIn <= new Date()) {
    throw new AppError(
      "That time slot has already started.",
      400,
      "SLOT_IN_PAST",
    );
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // Lock the room row so concurrent bookings for this room take turns.
      const room = await Room.findByPk(roomId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!room || !room.is_active) {
        throw new AppError("Room not found.", 404, "ROOM_NOT_FOUND");
      }

      // We hold the room lock now. If a concurrent request with the same
      // key just committed, replay it instead of failing.
      const raced = await Booking.findOne({
        where: { idempotency_key: idempotencyKey },
        transaction: t,
      });
      if (raced) return { replayedBooking: raced };

      if (guestCount > room.capacity) {
        throw new AppError(
          `This room fits up to ${room.capacity} guests.`,
          400,
          "GUEST_LIMIT_EXCEEDED",
        );
      }

      const ratePlan = await RatePlan.findOne({
        where: { duration_hours: durationHours, is_active: true },
        transaction: t,
      });
      if (!ratePlan) {
        throw new AppError("Rate plan not found.", 404, "RATE_PLAN_NOT_FOUND");
      }

      // Release unpaid holds that ran out.
      await Booking.update(
        { status: "expired" },
        {
          where: {
            room_id: room.id,
            status: "pending",
            hold_expires_at: { [Op.lt]: new Date() },
          },
          transaction: t,
        },
      );

      const bufferMs = CLEANING_BUFFER_HOURS * HOUR_MS;
      const nearby = await Booking.findAll({
        where: {
          room_id: room.id,
          status: { [Op.in]: ACTIVE_BOOKING_STATUSES },
          check_in: { [Op.lt]: new Date(checkOut.getTime() + bufferMs) },
          check_out: { [Op.gt]: new Date(checkIn.getTime() - bufferMs) },
        },
        attributes: ["check_in", "check_out"],
        transaction: t,
      });

      if (
        nearby.some((b) =>
          overlapsWithBuffer(b.check_in, b.check_out, checkIn, checkOut),
        )
      ) {
        throw new AppError(
          "That time slot is no longer available.",
          409,
          "SLOT_UNAVAILABLE",
        );
      }

      const created = await Booking.create(
        {
          user_id: user.id,
          room_id: room.id,
          rate_plan_id: ratePlan.id,
          check_in: checkIn,
          check_out: checkOut,
          guest_count: guestCount,
          total_price_centavos: calculateTotal(
            ratePlan.price_centavos,
            guestCount,
          ),
          status: "pending",
          idempotency_key: idempotencyKey,
          special_requests: specialRequests || null,
          hold_expires_at: new Date(Date.now() + HOLD_MINUTES * MINUTE_MS),
        },
        { transaction: t },
      );
      return { created };
    });

    if (result.replayedBooking) return replay(result.replayedBooking, user);
    return { booking: result.created, replayed: false };
  } catch (err) {
    // Two identical requests at the same instant: the other one won.
    if (err instanceof UniqueConstraintError) {
      const winner = await findByKey(idempotencyKey);
      if (winner) return replay(winner, user);
    }
    // DB overlap guard fired: last line of defense.
    if (err instanceof ExclusionConstraintError) {
      throw new AppError(
        "That time slot is no longer available.",
        409,
        "SLOT_UNAVAILABLE",
      );
    }
    throw err;
  }
}

module.exports = { createBooking };
