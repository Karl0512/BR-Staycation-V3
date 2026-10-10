"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE rate_plans DROP CONSTRAINT rate_plans_duration_check;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE rate_plans ADD CONSTRAINT rate_plans_duration_check CHECK (duration_hours IN (8, 12, 22));`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE rate_plans DROP CONSTRAINT rate_plans_duration_check;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE rate_plans ADD CONSTRAINT rate_plans_duration_check CHECK (duration_hours IN (8, 12, 24));`,
    );
  },
};
