const bookingService = require("../services/booking.service");
const {
  createBookingSchema,
  idempotencyKeySchema,
} = require("../validators/booking.validator");
const { calculateDownpayment } = require("../utils/pricing");
const AppError = require("../utils/AppError");

async function create(req, res, next) {
  try {
    const parsedKey = idempotencyKeySchema.safeParse(
      req.get("Idempotency-Key"),
    );
    if (!parsedKey.success) {
      throw new AppError(
        "A valid Idempotency-Key header (a UUID) is required.",
        400,
        "IDEMPOTENCY_KEY_REQUIRED",
      );
    }

    const input = createBookingSchema.parse(req.body);

    const { booking, replayed } = await bookingService.createBooking({
      user: req.user,
      idempotencyKey: parsedKey.data,
      input,
    });

    res.status(replayed ? 200 : 201).json({
      success: true,
      data: {
        booking,
        downpaymentCentavos: calculateDownpayment(booking.total_price_centavos),
        replayed,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create };
