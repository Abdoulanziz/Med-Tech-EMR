'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('visits', 'patient_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'patients',
          key: 'patient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('visits', 'user_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('allergies', 'visit_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'visits',
          key: 'visit_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('diagnoses', 'visit_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'visits',
          key: 'visit_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('diagnosis_reports', 'diagnosis_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'diagnoses',
          key: 'diagnosis_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('queues', 'user_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('queues', 'patient_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'patients',
          key: 'patient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('users', 'role_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'roles',
          key: 'role_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('triages', 'visit_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'visits',
          key: 'visit_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('visits', 'patient_id'),
      queryInterface.removeColumn('visits', 'user_id'),
      queryInterface.removeColumn('allergies', 'visit_id'),
      queryInterface.removeColumn('queues', 'user_id'),
      queryInterface.removeColumn('queues', 'patient_id'),
      queryInterface.removeColumn('users', 'role_id'),
      queryInterface.removeColumn('triages', 'visit_id'),
    ]);
  },
};
