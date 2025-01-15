'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lab_results_for_complete_blood_count', {
      result_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      result_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      white_blood_cell_count: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lymphocyte_absolute: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mid: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gran: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lymphocyte_percentage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mid_percentage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gran_percentage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      haemoglobin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      red_blood_cell_count: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      packed_cell_volume: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mean_cell_volume: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mean_cell_haemoglobin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mchc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rdwCv: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rdwSd: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      platelete_count: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mpv: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pwd: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pct: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      erythrocyte_sedimentation_rate: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comment: {
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
    await queryInterface.dropTable('lab_results_for_complete_blood_count');
  }
};