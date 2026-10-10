const { User } = require("../models");
const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const env = require("../config/env");

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[env.COOKIE_NAME];
    if (!token) {
      throw new AppError("You must be logged in.", 401, "NOT_AUTHENTICATED");
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError(
        "Your session is invalid or expired. Please log in again.",
        401,
        "INVALID_TOKEN",
      );
    }

    const user = await User.findByPk(payload.sub);
    if (!user) {
      throw new AppError(
        "Your session is invalid. Please log in again.",
        401,
        "INVALID_TOKEN",
      );
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to do this.",
          403,
          "FORBIDDEN",
        ),
      );
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
