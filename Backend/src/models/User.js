const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Booking, { foreignKey: "user_id", as: "bookings" });
    }

    // Never send the password hash in an API response.
    toSafeJSON() {
      const { password_hash, ...safe } = this.toJSON();
      return safe;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      full_name: { type: DataTypes.STRING(100), allowNull: false },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "user",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
    },
  );

  return User;
};
