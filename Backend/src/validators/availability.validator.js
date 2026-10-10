const { z } = require("zod");
const { SLOTS_BY_DURATION } = require("../config/bookingSlots");

const availabilityQuerySchema = z
  .object({
    from: z.string().date("from must be a valid date (YYYY-MM-DD)"),
    to: z.string().date("to must be a valid date (YYYY-MM-DD)"),
  })
  .refine((data) => data.to > data.from, {
    message: "to must be after from",
    path: ["to"],
  });

const slotsQuerySchema = z.object({
  date: z.string().date("date must be a valid date (YYYY-MM-DD)"),
  durationHours: z.coerce
    .number()
    .int()
    .refine((n) => Object.keys(SLOTS_BY_DURATION).map(Number).includes(n), {
      message: "durationHours must be one of: 8, 12, 22",
    }),
});

module.exports = { availabilityQuerySchema, slotsQuerySchema };
