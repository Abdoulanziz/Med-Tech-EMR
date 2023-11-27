'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clinical_requests_for_dental', {
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
      tooth_type: {
        type: Sequelize.ENUM('Pre-molar', 'Molar', 'Incisor', 'Canine'),
        defaultValue: 'Pre-molar',
        allowNull: false,
      },
      diagnosis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      procedure: {
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
    await queryInterface.dropTable('clinical_requests_for_dental');
  }
};