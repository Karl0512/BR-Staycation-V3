const app = require("./app");
const env = require("./config/env");
const sequelize = require("./config/database");

let server;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    server = app.listen(env.PORT, () => {
      console.log(
        `BR Staycation API running on port ${env.PORT} (${env.NODE_ENV})`,
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  setTimeout(() => process.exit(1), 10000).unref(); // force-exit if stuck

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await sequelize.close();
      console.log("Database connections closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

start();
