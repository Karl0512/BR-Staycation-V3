const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",

  // Supabase requires SSL.
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  pool: {
    max: env.DB_POOL_MAX, // maximum simultaneous connections
    min: 0,
    acquire: 30000, // wait up to 30s for a free connection before erroring
    idle: 10000, // release connections idle for 10s
  },

  // Print SQL only in development, and keep it quiet in production.
  logging: env.NODE_ENV === "development" ? console.log : false,

  // Store and read all timestamps as UTC. Important for booking times.
  timezone: "+00:00",
});

module.exports = sequelize;
