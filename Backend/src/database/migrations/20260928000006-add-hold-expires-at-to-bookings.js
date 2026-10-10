"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("bookings", "hold_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex("bookings", ["status", "hold_expires_at"], {
      name: "bookings_status_hold_expires_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "bookings",
      "bookings_status_hold_expires_idx",
    );
    await queryInterface.removeColumn("bookings", "hold_expires_at");
  },
};
