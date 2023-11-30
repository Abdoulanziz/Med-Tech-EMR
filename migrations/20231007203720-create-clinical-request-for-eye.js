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
      target_eye: {
        type: Sequelize.ENUM('right', 'left'),
        defaultValue: 'right',
        allowNull: false,
      },
      diagnosis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      service_fee: {
        type: Sequelize.STRING,
        allowNull: true,
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