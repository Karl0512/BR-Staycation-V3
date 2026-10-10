const TIMEZONE_OFFSET = "+08:00";
const CLEANING_BUFFER_HOURS = 2;
const HOLD_MINUTES = 15;

const SLOTS_BY_DURATION = {
  8: ["08:00", "20:00"],
  12: ["08:00", "20:00"],
  22: ["12:00"],
};

const HOUR_MS = 60 * 60 * 1000;

function buildSlotRange(date, time, durationHours) {
  const checkIn = new Date(`${date}T${time}:00${TIMEZONE_OFFSET}`);
  const checkOut = new Date(checkIn.getTime() + durationHours * HOUR_MS);
  return { checkIn, checkOut };
}

// Symmetric: true if two bookings overlap or are closer than the cleaning buffer.
function overlapsWithBuffer(aStart, aEnd, bStart, bEnd) {
  const bufferMs = CLEANING_BUFFER_HOURS * HOUR_MS;
  return (
    aStart.getTime() < bEnd.getTime() + bufferMs &&
    bStart.getTime() < aEnd.getTime() + bufferMs
  );
}

module.exports = {
  TIMEZONE_OFFSET,
  CLEANING_BUFFER_HOURS,
  HOLD_MINUTES,
  SLOTS_BY_DURATION,
  HOUR_MS,
  buildSlotRange,
  overlapsWithBuffer,
};
