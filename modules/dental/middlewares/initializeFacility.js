const { Facility, FacilitySetting } = require('../models');
const { FACILITY_NAME, FACILITY_ADDRESS, FACILITY_PRIMARY_EMAIL, FACILITY_SECONDARY_EMAIL, FACILITY_PHONE_NUMBER } = process.env;

async function initializeFacility() {
  try {
    const facilityName = FACILITY_NAME;
    const facilityAddress = FACILITY_ADDRESS;
    const primaryEmail = FACILITY_PRIMARY_EMAIL;
    const secondaryEmail = FACILITY_SECONDARY_EMAIL;
    const phoneNumber = FACILITY_PHONE_NUMBER;

    // Check if the facility already exists
    const existingFacility = await Facility.findOne({
      where: { facilityName, facilityAddress, primaryEmail, secondaryEmail, phoneNumber },
    });

    if (existingFacility) {
      console.log('Facility already exists. Skipping creation.');
      return;
    }

    // Create the initial facility
    const createdFacility = await Facility.create({
      facilityName,
      facilityAddress,
      primaryEmail,
      secondaryEmail,
      phoneNumber,
    });

    console.log('Facility account created successfully.');

    // Create settings for the newly created facility
    await FacilitySetting.bulkCreate([
      {
        facilityId: createdFacility.facilityId,
        facilitySettingName: 'send_close_of_day_financial_summaries',
        facilitySettingValue: true,
      },
      {
        facilityId: createdFacility.facilityId,
        facilitySettingName: 'send_real_time_expense_tracking',
        facilitySettingValue: false,
      },
      {
        facilityId: createdFacility.facilityId,
        facilitySettingName: 'generate_weekly_sales_reports',
        facilitySettingValue: false,
      },
    ]);

    console.log('Facility settings created successfully.');
  } catch (error) {
    console.error('Error creating facility account:', error);
  }
}

module.exports = initializeFacility;
