const bcrypt = require("bcrypt");
const { User } = require("../models");
const AppError = require("../utils/AppError");
const { signToken } = require("../utils/jwt");

const BCRYPT_ROUNDS = 12;

async function register({ email, password, full_name, phone }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new AppError(
      "An account with this email already exists.",
      409,
      "EMAIL_TAKEN",
    );
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({ email, password_hash, full_name, phone });

  const token = signToken(user);
  return { user: user.toSafeJSON(), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });

  // Same error for "no user" and "wrong password" — don't reveal which emails exist.
  const invalidCredentialsError = new AppError(
    "Invalid email or password.",
    401,
    "INVALID_CREDENTIALS",
  );

  if (!user) throw invalidCredentialsError;

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) throw invalidCredentialsError;

  const token = signToken(user);
  return { user: user.toSafeJSON(), token };
}

module.exports = { register, login };
