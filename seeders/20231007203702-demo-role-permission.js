'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('role_permissions', [
      {
        role_permission_uuid: uuidv4(),
        role_id: 1,
        permission_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_permission_uuid: uuidv4(),
        role_id: 2,
        permission_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};
