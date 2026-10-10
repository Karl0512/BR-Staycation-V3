const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class WebhookEvent extends Model {
    static associate() {
      // No associations — this table is a standalone log of raw events.
    }
  }

  WebhookEvent.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      provider: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "paymongo",
      },
      event_id: { type: DataTypes.STRING(100), allowNull: false },
      event_type: { type: DataTypes.STRING(100), allowNull: false },
      payload: { type: DataTypes.JSONB, allowNull: false },
      processed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "WebhookEvent",
      tableName: "webhook_events",
      underscored: true,
      updatedAt: false, // this table only has created_at, no updated_at column
    },
  );

  return WebhookEvent;
};
