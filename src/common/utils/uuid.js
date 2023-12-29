require("dotenv").config();
const moment = require("moment");
const { Patient } = require('../models');

const { HOSPITAL_NAME } = process.env;

async function generatePatientId() {
    const hospitalAbbr = HOSPITAL_NAME
      .split(' ')
      .map((word) => word[0].toUpperCase())
      .join('');
  
    const today = moment();
    const year = today.format('YY');
    const month = today.format('MM');
    const day = today.format('DD');
    const hour = today.format('HH');
    const minute = today.format('mm');
    const second = today.format('ss');
  
    const patientId = `${hospitalAbbr}/P/${year}/${month}/${day}/${hour}${minute}${second}`;
  
    try {
      // Check if the ID exists in the database
      const existingPatient = await Patient.findOne({
        where: {
          id: 1,
        },
      });
  
      if (existingPatient) {
        // If the ID exists, regenerate it
        return generatePatientId();
      }
  
      return patientId;
    } catch (error) {
      console.error('Error checking if patient ID exists:', error);
      throw new Error('An error occurred while generating the patient ID.');
    }
}

module.exports = {generatePatientId};
