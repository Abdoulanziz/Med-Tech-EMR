'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('roles', [
      { // role_id: 1,
        role_uuid: uuidv4(),
        role_name: 'superadmin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      { // role_id: 2,
        role_uuid: uuidv4(),
        role_name: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      { // role_id: 3,
        role_uuid: uuidv4(),
        role_name: 'doctor',
        created_at: new Date(),
        updated_at: new Date(),
      },
      { // role_id: 4,
        role_uuid: uuidv4(),
        role_name: 'nurse',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
