"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "CREATE EXTENSION IF NOT EXISTS btree_gist;",
    );
    await queryInterface.sequelize.query(
      "CREATE EXTENSION IF NOT EXISTS citext;",
    );
  },

  async down() {},
};
