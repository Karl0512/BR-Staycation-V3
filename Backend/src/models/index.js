const sequelize = require("../config/database");

const User = require("./User")(sequelize);
const Room = require("./Room")(sequelize);
const RatePlan = require("./RatePlan")(sequelize);
const Booking = require("./Booking")(sequelize);
const Payment = require("./Payment")(sequelize);
const WebhookEvent = require("./WebhookEvent")(sequelize);

const db = { sequelize, User, Room, RatePlan, Booking, Payment, WebhookEvent };

Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

module.exports = db;
