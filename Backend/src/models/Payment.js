const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Booking, {
        foreignKey: "booking_id",
        as: "booking",
      });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      booking_id: { type: DataTypes.UUID, allowNull: false },
      provider: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "paymongo",
      },
      provider_reference: { type: DataTypes.STRING(100), allowNull: true },
      amount_centavos: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      paid_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      underscored: true,
    },
  );

  return Payment;
};
