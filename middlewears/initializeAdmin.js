require("dotenv").config();
const bcrypt = require('bcrypt');
const { User } = require('../models');

const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

async function initializeAdmin() {
  try {
    const adminUsername = ADMIN_USERNAME;
    const adminPassword = ADMIN_PASSWORD;
    
    // Check if the admin user already exists
    const existingAdmin = await User.findOne({ where: { username: adminUsername } });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }

    // Hash and salt the admin password securely
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the initial admin user
    await User.create({
      username: adminUsername,
      password: hashedPassword,
      roleId: 1,
    });

    console.log('Admin account created successfully.');
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
}

module.exports = initializeAdmin;
