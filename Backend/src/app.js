const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Render sits behind a proxy. Needed later for secure cookies and rate limiting.
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // required so the browser will send/receive cookies
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use("/api/v1", routes);

// These two MUST come last, in this order.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
