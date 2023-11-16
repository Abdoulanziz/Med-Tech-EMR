'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      {
        user_uuid: uuidv4(),
        username: 'abdoul',
        password: '$2b$10$BfxM7ko7ILI8XPfMA95WL.tTWsfuzV5L6cKfwc8K3RazQVCuywrAy',
        role_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_uuid: uuidv4(),
        username: 'felix',
        password: '$2b$10$BfxM7ko7ILI8XPfMA95WL.tTWsfuzV5L6cKfwc8K3RazQVCuywrAy',
        role_id: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_uuid: uuidv4(),
        username: 'caxton',
        password: '$2b$10$BfxM7ko7ILI8XPfMA95WL.tTWsfuzV5L6cKfwc8K3RazQVCuywrAy',
        role_id: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
