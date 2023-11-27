'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clinical_requests_for_eye', {
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
      specific_eye: {
        type: Sequelize.ENUM('right', 'left'),
        allowNull: true,
      },
      diagnosis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      service_fee: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      observation_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      description_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable('clinical_requests_for_eye');
  }
};