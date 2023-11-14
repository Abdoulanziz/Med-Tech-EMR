'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('users', 'role_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'roles',
          key: 'role_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('doctors', 'user_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('visits', 'patient_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'patients',
          key: 'patient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('visits', 'doctor_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'doctors',
          key: 'doctor_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('queues', 'doctor_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'doctors',
          key: 'doctor_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('queues', 'visit_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'visits',
          key: 'visit_id',
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

      queryInterface.changeColumn('triages', 'visit_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'visits',
          key: 'visit_id',
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

      queryInterface.changeColumn('lab_requests', 'test_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'lab_tests',
          key: 'test_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('lab_requests', 'visit_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'visits',
          key: 'visit_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('lab_results_for_complete_blood_count', 'request_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'lab_requests',
          key: 'request_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      queryInterface.changeColumn('lab_results_for_urinalysis', 'request_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'lab_requests',
          key: 'request_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'role_id'),
      queryInterface.removeColumn('doctors', 'user_id'),
      queryInterface.removeColumn('visits', 'patient_id'),
      queryInterface.removeColumn('visits', 'doctor_id'),
      queryInterface.removeColumn('queues', 'doctor_id'),
      queryInterface.removeColumn('queues', 'visit_id'),
      queryInterface.removeColumn('queues', 'patient_id'),
      queryInterface.removeColumn('triages', 'visit_id'),
      queryInterface.removeColumn('allergies', 'visit_id'),
      queryInterface.removeColumn('diagnoses', 'visit_id'),
      queryInterface.removeColumn('diagnosis_reports', 'diagnosis_id'),
      queryInterface.removeColumn('lab_requests', 'test_id'),
      queryInterface.removeColumn('lab_requests', 'visit_id'),
      queryInterface.removeColumn('lab_results_for_complete_blood_count', 'request_id'),
      queryInterface.removeColumn('lab_results_for_urinalysis', 'request_id'),
    ]);
  },
};
