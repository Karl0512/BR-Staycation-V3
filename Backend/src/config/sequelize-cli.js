const env = require("./env");

const shared = {
  url: env.DATABASE_URL,
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
};

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};
