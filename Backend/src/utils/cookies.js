const env = require("../config/env");

function msFromExpiresIn(expiresIn) {
  // Supports simple formats like "7d", "12h", "30m".
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // fallback: 7 days
  const value = Number(match[1]);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return value * unit;
}

function setAuthCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production", // HTTPS only in production
    sameSite: env.NODE_ENV === "production" ? "none" : "lax", // 'none' needed for Vercel <-> Render
    maxAge: msFromExpiresIn(env.JWT_EXPIRES_IN),
    path: "/",
  });
}

function clearAuthCookie(res) {
  res.clearCookie(env.COOKIE_NAME, { path: "/" });
}

module.exports = { setAuthCookie, clearAuthCookie };
