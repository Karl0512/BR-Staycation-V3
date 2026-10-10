"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "rooms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      rate_plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "rate_plans",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      check_in: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      check_out: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      guest_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      total_price_centavos: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      // Unique key to guarantee idempotency on retried booking creation requests
      idempotency_key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      special_requests: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Indexes for common queries
    await queryInterface.addIndex("bookings", ["user_id"]);
    await queryInterface.addIndex("bookings", ["status"]);

    // Ensure check_out is strictly after check_in
    await queryInterface.sequelize.query(
      `ALTER TABLE bookings ADD CONSTRAINT bookings_dates_check CHECK (check_out > check_in);`
    );

    // Ensure positive price
    await queryInterface.sequelize.query(
      `ALTER TABLE bookings ADD CONSTRAINT bookings_total_price_check CHECK (total_price_centavos > 0);`
    );

    // Ensure valid guest count
    await queryInterface.sequelize.query(
      `ALTER TABLE bookings ADD CONSTRAINT bookings_guest_count_check CHECK (guest_count > 0);`
    );

    // Valid booking statuses
    await queryInterface.sequelize.query(
      `ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
       CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'expired'));`
    );

    // Exclusion constraint using GiST: Prevents overlapping reservations for the same room.
    // Cancelled or expired bookings do NOT block future reservations.
    await queryInterface.sequelize.query(
      `ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap_check
       EXCLUDE USING gist (
         room_id WITH =,
         tstzrange(check_in, check_out) WITH &&
       )
       WHERE (status NOT IN ('cancelled', 'expired'));`
    );

    // Enable Row-Level Security
    await queryInterface.sequelize.query(
      "ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;"
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("bookings");
  },
};
