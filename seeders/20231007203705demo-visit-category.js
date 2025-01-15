'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('visit_categories', [
      {
        visit_category_uuid: uuidv4(),
        visit_category_name: 'Consultation',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        visit_category_uuid: uuidv4(),
        visit_category_name: 'Treatment',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        visit_category_uuid: uuidv4(),
        visit_category_name: 'Other',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('visit_categories', null, {});
  }
};
