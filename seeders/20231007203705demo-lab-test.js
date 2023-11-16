'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('lab_tests', [
      {
        test_uuid: uuidv4(),
        test_name: 'Complete Blood Count Test',
        test_fees: 15000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Lipid Profile Test",
        test_fees: 20000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Liver Function Test",
        test_fees: 25000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Kidney Function Test",
        test_fees: 30000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Urinalysis Test",
        test_fees: 10000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Stool Analysis Test",
        test_fees: 12000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Blood Glucose Test",
        test_fees: 5000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Hemoglobin A1c Test",
        test_fees: 7000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Cholesterol Test",
        test_fees: 8000,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        test_uuid: uuidv4(),
        test_name: "Thyroid Test",
        test_fees: 9000,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lab_tests', null, {});
  }
};
