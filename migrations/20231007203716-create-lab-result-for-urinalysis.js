'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lab_results_for_urinalysis', {
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
      appearance: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      glucose: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ketone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      blood: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ph: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      protein: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nitrites: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      leucocytes: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      urobilinogen: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bilirubin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      specific_gravity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rbc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pus_cells: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      epithelial_cells: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cast: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wbc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      parasite: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      crystals: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      t_vaginalis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      yeast_cells: {
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
    await queryInterface.dropTable('lab_results_for_urinalysis');
  }
};