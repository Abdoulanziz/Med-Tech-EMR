'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diagnoses', {
      diagnosis_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      diagnosis_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      test_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clinical_notes: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fees: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('diagnoses');
  }
};