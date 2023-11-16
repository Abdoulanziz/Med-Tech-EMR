'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('doctors', [
      {
        doctor_uuid: uuidv4(),
        user_id: 3,
        first_name: 'Caxton',
        last_name: 'Mulondo',
        date_of_birth: '1990-01-01',
        gender: 'Male',
        contact_number: '0704356786',
        email: 'caxtonmulondo@gmail.com',
        specialty_id: null,
        department: null,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('doctors', null, {});
  }
};
