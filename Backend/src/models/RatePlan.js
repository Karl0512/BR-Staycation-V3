const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class RatePlan extends Model {
    static associate(models) {
      RatePlan.hasMany(models.Booking, {
        foreignKey: "rate_plan_id",
        as: "bookings",
      });
    }
  }

  RatePlan.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      duration_hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      price_centavos: { type: DataTypes.INTEGER, allowNull: false },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "RatePlan",
      tableName: "rate_plans",
      underscored: true,
    },
  );

  return RatePlan;
};
