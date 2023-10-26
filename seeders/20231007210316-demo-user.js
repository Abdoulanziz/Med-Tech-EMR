'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      {
        user_uuid: uuidv4(),
        first_name: 'Caxton',
        last_name: 'Mulondo',
        date_of_birth: '1990-01-01',
        gender: 'Male',
        contact_number: '0704356786',
        email: 'caxtonmulondo@gmail.com',
        password: '$2b$10$BfxM7ko7ILI8XPfMA95WL.tTWsfuzV5L6cKfwc8K3RazQVCuywrAy',
        role_id: 3,
        specialty_id: null,
        department: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_uuid: uuidv4(),
        first_name: 'John',
        last_name: 'North',
        date_of_birth: '1995-02-15',
        gender: 'Male',
        contact_number: '0701256377',
        email: 'johnnorth@gmail.com',
        password: '$2b$10$BfxM7ko7ILI8XPfMA95WL.tTWsfuzV5L6cKfwc8K3RazQVCuywrAy',
        role_id: 3,
        specialty_id: null,
        department: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_uuid: uuidv4(),
        first_name: 'Abdoulanziz',
        last_name: 'Ally',
        date_of_birth: '1990-02-15',
        gender: 'Male',
        contact_number: '0772364888',
        email: 'abdoulanzizally@outlook.com',
        password: '$2b$10$BfxM7ko7ILI8XPfMA95WL.tTWsfuzV5L6cKfwc8K3RazQVCuywrAy',
        role_id: 3,
        specialty_id: null,
        department: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
