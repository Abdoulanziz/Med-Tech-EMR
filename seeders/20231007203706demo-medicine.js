'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('medicines', [
      {
        medicine_uuid: uuidv4(),
        medicine_name: 'Panadol Extra',
        medicine_type: 'tablet',
        dosage: '50g',
        manufacturer: 'Ken BioTech',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        medicine_uuid: uuidv4(),
        medicine_name: "Curamol Plus",
        medicine_type: 'tablet',
        dosage: '100g',
        manufacturer: 'Ken BioTech',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        medicine_uuid: uuidv4(),
        medicine_name: "Diclofenac",
        medicine_type: 'cream',
        dosage: '40g',
        manufacturer: 'Ken BioTech',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        medicine_uuid: uuidv4(),
        medicine_name: "Kazire",
        medicine_type: 'syrap',
        dosage: '100ml',
        manufacturer: 'Ken BioTech',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('medicines', null, {});
  }
};
