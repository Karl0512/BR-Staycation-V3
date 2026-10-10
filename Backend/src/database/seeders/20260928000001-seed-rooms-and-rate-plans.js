"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("rooms", [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Room1",
        description:
          "Staycation room, up to 5 guests. Base rate covers 2 guests; +PHP 300 per additional guest.",
        capacity: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Room2",
        description:
          "Staycation room, up to 5 guests. Base rate covers 2 guests; +PHP 300 per additional guest.",
        capacity: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("rate_plans", [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        duration_hours: 8,
        price_centavos: 100000, // PHP 1,000
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        duration_hours: 12,
        price_centavos: 120000, // PHP 1,200
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        duration_hours: 22,
        price_centavos: 170000, // PHP 1,700
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("rate_plans", null, {});
    await queryInterface.bulkDelete("rooms", null, {});
  },
};
