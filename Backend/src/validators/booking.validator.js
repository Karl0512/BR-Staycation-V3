const { z } = require("zod");
const { SLOTS_BY_DURATION } = require("../config/bookingSlots");

const createBookingSchema = z.object({
  roomId: z.string().uuid(),
  date: z.string().date("date must be a valid date (YYYY-MM-DD)"),
  durationHours: z.coerce
    .number()
    .int()
    .refine((n) => Object.keys(SLOTS_BY_DURATION).map(Number).includes(n), {
      message: "durationHours must be one of: 8, 12, 22",
    }),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "startTime must look like 08:00"),
  guestCount: z.coerce.number().int().min(1),
  specialRequests: z.string().max(500).optional(),
});

const idempotencyKeySchema = z.string().uuid();

module.exports = { createBookingSchema, idempotencyKeySchema };
