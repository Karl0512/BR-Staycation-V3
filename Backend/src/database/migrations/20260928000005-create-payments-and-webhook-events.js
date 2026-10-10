"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // -------------------------------------------------------------------------
    // 1. Payments Table
    // Holds each payment attempt for a reservation. Multiple attempts can exist
    // (e.g., failed GCash, followed by another try), but only one can be 'paid'.
    // -------------------------------------------------------------------------
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "bookings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      amount_centavos: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "PHP",
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "gcash",
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      paymongo_payment_intent_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      paymongo_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      checkout_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
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

    // Query indexes for payments
    await queryInterface.addIndex("payments", ["booking_id"]);
    await queryInterface.addIndex("payments", ["status"]);

    // Ensure positive payment amounts
    await queryInterface.sequelize.query(
      `ALTER TABLE payments ADD CONSTRAINT payments_amount_check CHECK (amount_centavos > 0);`,
    );

    // Permitted payment statuses
    await queryInterface.sequelize.query(
      `ALTER TABLE payments ADD CONSTRAINT payments_status_check
       CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'expired'));`,
    );

    // Partial Unique Index: A booking can have multiple attempts, but ONLY ONE can be 'paid'
    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX payments_one_paid_per_booking_idx
       ON payments (booking_id)
       WHERE (status = 'paid');`,
    );

    // Enable Row-Level Security on payments
    await queryInterface.sequelize.query(
      "ALTER TABLE payments ENABLE ROW LEVEL SECURITY;",
    );

    // -------------------------------------------------------------------------
    // 2. Webhook Events Table
    // Idempotency barrier for PayMongo webhook deliveries. Duplicate event IDs
    // are rejected by the unique constraint before processing occurs.
    // -------------------------------------------------------------------------
    await queryInterface.createTable("webhook_events", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      // Unique event ID assigned by PayMongo (e.g., 'evt_...')
      paymongo_event_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      event_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      processed_at: {
        type: Sequelize.DATE,
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

    // Query indexes for webhook_events
    await queryInterface.addIndex("webhook_events", ["event_type"]);
    await queryInterface.addIndex("webhook_events", ["status"]);

    // Webhook event processing status constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE webhook_events ADD CONSTRAINT webhook_events_status_check
       CHECK (status IN ('pending', 'processed', 'failed', 'ignored'));`,
    );

    // Enable Row-Level Security on webhook_events
    await queryInterface.sequelize.query(
      "ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;",
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("webhook_events");
  },
};
