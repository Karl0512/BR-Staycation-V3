const env = require("../config/env");
const { ZodError } = require("zod");

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data.",
        details: err.flatten().fieldErrors,
      },
    });
  }

  const isOperational = err.isOperational === true;
  const statusCode = isOperational ? err.statusCode : 500;

  // Log everything server-side. We'll upgrade this to a real logger later.
  if (!isOperational || statusCode >= 500) {
    console.error("Unexpected error:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: isOperational ? err.code : "INTERNAL_ERROR",
      message: isOperational ? err.message : "Something went wrong on our end.",
      ...(isOperational && err.details ? { details: err.details } : {}),
      ...(env.NODE_ENV === "development" && !isOperational
        ? { stack: err.stack }
        : {}),
    },
  });
};
