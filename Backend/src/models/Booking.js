const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Booking.belongsTo(models.Room, { foreignKey: "room_id", as: "room" });
      Booking.belongsTo(models.RatePlan, {
        foreignKey: "rate_plan_id",
        as: "ratePlan",
      });
      Booking.hasMany(models.Payment, {
        foreignKey: "booking_id",
        as: "payments",
      });
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      room_id: { type: DataTypes.UUID, allowNull: false },
      rate_plan_id: { type: DataTypes.UUID, allowNull: false },
      check_in: { type: DataTypes.DATE, allowNull: false },
      check_out: { type: DataTypes.DATE, allowNull: false },
      guest_count: { type: DataTypes.INTEGER, allowNull: false },
      total_price_centavos: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      idempotency_key: { type: DataTypes.STRING(100), allowNull: false },
      special_requests: { type: DataTypes.TEXT, allowNull: true },
      hold_expires_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "bookings",
      underscored: true,
    },
  );

  return Booking;
};
