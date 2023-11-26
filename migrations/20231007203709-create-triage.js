'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('triages', {
      triage_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      triage_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      blood_pressure: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      heart_rate: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      respiratory_rate: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      signs_and_symptoms: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      injury_details: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('triages');
  }
};