'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('queues', {
      queue_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      queue_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
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
      queue_status: {
        type: Sequelize.ENUM('Scheduled', 'Cancelled', 'Completed'),
        allowNull: false,
        defaultValue: 'Scheduled',
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
    await queryInterface.dropTable('queues');
  }
};