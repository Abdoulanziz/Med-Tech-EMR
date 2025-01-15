'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lab_requests', {
      request_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      request_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'lab_tests',
        //   key: 'test_id',
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'CASCADE',
      },
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'visits',
        //   key: 'visit_id',
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'CASCADE',
      },
      test_fees: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      clinical_notes: {
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
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lab_requests');
  }
};