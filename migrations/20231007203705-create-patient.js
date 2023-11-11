'use strict';

/** @type {import('sequelize').QueryInterface} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patients', {
      patient_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      patient_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      national_id_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alternative_contact_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      home_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email_address: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      nok_first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nok_last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nok_relationship: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nok_contact_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nok_home_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      insurance_provider_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      billing_method_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      blood_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('patients');
  }
};
