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
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      diagnosis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      procedure: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      service_fee: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM('unpaid', 'paid'),
        defaultValue: 'unpaid',
        allowNull: false,
      },
      request_status: {
        type: Sequelize.ENUM('pending', 'complete', 'canceled'),
        defaultValue: 'pending',
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