const authService = require("../services/auth.service");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { setAuthCookie, clearAuthCookie } = require("../utils/cookies");
const AppError = require("../utils/AppError");

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const { user, token } = await authService.register(data);
    setAuthCookie(res, token);
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const { user, token } = await authService.login(data);
    setAuthCookie(res, token);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  clearAuthCookie(res);
  res.status(200).json({ success: true, data: { message: "Logged out." } });
}

function me(req, res) {
  // req.user is attached by the auth middleware (next step)
  res
    .status(200)
    .json({ success: true, data: { user: req.user.toSafeJSON() } });
}

module.exports = { register, login, logout, me };
