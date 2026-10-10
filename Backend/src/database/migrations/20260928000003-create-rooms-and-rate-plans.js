"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rooms", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      capacity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 2 },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable("rate_plans", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      duration_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      price_centavos: { type: Sequelize.INTEGER, allowNull: false },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.sequelize.query(
      `ALTER TABLE rooms ADD CONSTRAINT rooms_capacity_check CHECK (capacity > 0);`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE rate_plans ADD CONSTRAINT rate_plans_duration_check CHECK (duration_hours IN (8, 12, 24));`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE rate_plans ADD CONSTRAINT rate_plans_price_check CHECK (price_centavos > 0);`,
    );

    await queryInterface.sequelize.query(
      "ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;",
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE rate_plans ENABLE ROW LEVEL SECURITY;",
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("rate_plans");
    await queryInterface.dropTable("rooms");
  },
};
