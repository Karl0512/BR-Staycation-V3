const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Room extends Model {
    static associate(models) {
      Room.hasMany(models.Booking, { foreignKey: "room_id", as: "bookings" });
    }
  }

  Room.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Room",
      tableName: "rooms",
      underscored: true,
    },
  );

  return Room;
};
