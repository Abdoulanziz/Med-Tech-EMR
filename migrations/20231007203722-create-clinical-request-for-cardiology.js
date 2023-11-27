'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clinical_requests_for_cardiology', {
      request_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      request_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      referral_reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      current_medication: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      observation_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      service_fee: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clinical_requests_for_cardiology');
  }
};