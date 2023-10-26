require("dotenv").config();
const bcrypt = require('bcrypt');
const { User } = require('../models');

const { ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DATE_OF_BIRTH, ADMIN_GENDER, ADMIN_CONTACT_NUMBER } = process.env;

async function initializeAdmin() {
  try {
    const adminEmail = ADMIN_EMAIL;
    const adminPassword = ADMIN_PASSWORD;
    
    // Check if the admin user already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }

    // Hash and salt the admin password securely
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the initial admin user
    await User.create({
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      dateOfBirth: ADMIN_DATE_OF_BIRTH,
      gender: ADMIN_GENDER,
      contactNumber: ADMIN_CONTACT_NUMBER,
      email: adminEmail,
      password: hashedPassword,
      roleId: 1,
    });

    console.log('Admin account created successfully.');
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
}

module.exports = initializeAdmin;
