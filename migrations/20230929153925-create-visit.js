'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visits', {
      visit_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      visit_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      visit_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      visit_category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      visit_status: {
        type: Sequelize.ENUM('Scheduled', 'Cancelled', 'Completed'),
        allowNull: false,
        defaultValue: 'Scheduled',
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'patients',
        //   key: 'patient_id',
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'CASCADE',
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'doctors',
        //   key: 'doctor_id',
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
    await queryInterface.dropTable('visits');
  }
};