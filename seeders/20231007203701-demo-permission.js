'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('permissions', [
      {
        permission_uuid: uuidv4(),
        permission_name: 'read',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        permission_uuid: uuidv4(),
        permission_name: 'write',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
