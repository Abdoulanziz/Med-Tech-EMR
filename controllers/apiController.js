const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const models = require('../models');
const sse = require('../middlewares/sse');

const { 
  User,
  Patient,
  Doctor,
  Visit,
  Queue,
  Triage,
  Allergy,
  ClinicalRequestForEye,
  ClinicalRequestForDental,
  ClinicalRequestForCardiology,
  ClinicalRequestForRadiology,
  LabTest,
  Medicine,
  LabRequest,
  LabResultForCompleteBloodCount,
  LabResultForUrinalysis,
  Prescription,
  AuditLog,
  Income,
  Expense,
} = require('../models');


const Op = Sequelize.Op;
const createAuditLog = require('../middlewares/auditLogger');

// Check API status
const checkAPIStatus = (req, res) => {
  res.status(200).json({ message: "The backend API is running" });
};

// Create a new user
const createUser = async (req, res) => {
  try {
    // Extract user data from the request body
    const { username, password, roleId } = req.body;

    // Check if the username already exists in the database
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash and salt the user securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record in the database
    const newUser = await User.create({ username, password: hashedPassword, roleId });

    // Create an audit log
    await createAuditLog('User', newUser.userId, 'CREATE', {}, newUser.dataValues, req.session.user.userId);

    // Respond with the newly created user object
    return res.status(201).json({ status: 'success', message: 'User record created successfully', data: newUser });

  } catch (error) {
    // Log out the error to the console
    console.error('Error creating user:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create a new doctor
const createDoctor = async (req, res) => {
  try {
    // Extract doctor data from the request body
    const { userId, firstName, lastName, dateOfBirth, gender, email, contactNumber } = req.body;

    // Check if the email already exists in the database
    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Create a new doctor record in the database
    const newDoctor = await Doctor.create({ userId, firstName, lastName, dateOfBirth, gender, email, contactNumber });

    // Update profile completion status
    await User.update( { profileCompletionStatus: "complete" }, { where: { userId: userId } });

    // Create an audit log
    await createAuditLog('Doctor', newDoctor.userId, 'CREATE', {}, newDoctor.dataValues, req.session.user.userId);

    // Respond with the newly created doctor object
    return res.status(201).json({ status: 'success', message: 'Doctor record created successfully', data: newDoctor });

  } catch (error) {
    // Log out the error to the console
    console.error('Error creating doctor:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch doctor
const fetchDoctorByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId) {
      // If userId is provided, fetch the specific doctor by ID
      const doctor = await Doctor.findOne({where: {userId}});

      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      return res.status(200).json({data: doctor});
    }

  } catch (error) {
    console.error('Error fetching doctor:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update a doctor
const updateDoctor = async (req, res) => {
  try {
    // Extract doctor data from the request body
    const { firstName, lastName, dateOfBirth, gender, email, contactNumber } = req.body;
    const userId = req.params.id;


    // Check if the doctor already exists in the database
    const existingDoctor = await Doctor.findOne({ where: { userId } });

    if (!existingDoctor) {
      return res.status(400).json({ message: 'Doctor does not exist' });
    }

    // Update the doctor record in the database
    const updatedDoctor = await existingDoctor.update({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      contactNumber,
    });

    // Create an audit log
    await createAuditLog('Doctor', userId, 'UPDATE', existingDoctor.dataValues, updatedDoctor.dataValues, req.session.user.userId);

    // Respond with the updated doctor object
    return res.status(200).json({ status: 'success', message: 'Doctor record updated successfully', data: updatedDoctor });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating doctor:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch users
const fetchUsers = async (req, res) => {
  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;

    const filter = {};
    const sort = [];

    if (searchValue) {
      filter[Op.or] = [
        { firstName: { [Op.iLike]: `%${searchValue}%` } },
        { lastName: { [Op.iLike]: `%${searchValue}%` } },
        // Add more columns to search here as needed
      ];
    }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      0: 'user_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order

    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
      include: [
        {
          model: models.Role,
          attributes: ['roleName'],
        },
      ],
    };

    const result = await User.findAndCountAll(queryOptions);


    // Access the role's fields in each user result
    const usersWithRoles = result.rows.map((user) => ({
      // Extract fields from the 'Role' model
      userRole: user.Role.roleName,
      userId: user.userId,
      userAccountStatus: user.accountStatus,
      userProfileCompletionStatus: user.profileCompletionStatus,
      username: user.username,
      createdAt: user.createdAt,
    }));

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: usersWithRoles,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create a new patient
const createPatient = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, contactNumber } = req.body;

    // Convert empty strings to null for nullable fields
    const nationalIDNumber = req.body.nationalIDNumber || null;
    const age = req.body.age || null;
    const alternativeContactNumber = req.body.alternativeContactNumber || null;
    const homeAddress = req.body.homeAddress || null;
    const emailAddress = req.body.emailAddress || null;
    const nokFirstName = req.body.nokFirstName || null;
    const nokLastName = req.body.nokLastName || null;
    const nokRelationship = req.body.nokRelationship || null;
    const nokContactNumber = req.body.nokContactNumber || null;
    const nokHomeAddress = req.body.nokHomeAddress || null;
    const billingMethodId = req.body.billingMethodId || null;

    const existingPatient = await Patient.findOne({ where: { contactNumber: contactNumber } });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    const newPatient = await Patient.create({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      nationalIDNumber,
      age,
      alternativeContactNumber,
      homeAddress,
      emailAddress,
      nokFirstName,
      nokLastName,
      nokRelationship,
      nokContactNumber,
      nokHomeAddress,
      billingMethodId,
    });

    // Create an audit log
    await createAuditLog('Patient', newPatient.patientId, 'CREATE', {}, newPatient.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'Patient record created successfully', data: newPatient });
  } catch (error) {
    console.error('Error creating patient:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update a patient
const updatePatient = async (req, res) => {
  try {
    // Extract patient data from the request body

    const { firstName, lastName, dateOfBirth, gender, contactNumber } = req.body;

    // Convert empty strings to null for nullable fields
    const nationalIDNumber = req.body.nationalIDNumber || null;
    const age = req.body.age || null;
    const alternativeContactNumber = req.body.alternativeContactNumber || null;
    const homeAddress = req.body.homeAddress || null;
    const emailAddress = req.body.emailAddress || null;
    const nokFirstName = req.body.nokFirstName || null;
    const nokLastName = req.body.nokLastName || null;
    const nokRelationship = req.body.nokRelationship || null;
    const nokContactNumber = req.body.nokContactNumber || null;
    const nokHomeAddress = req.body.nokHomeAddress || null;
    const billingMethodId = req.body.billingMethodId || null;


    const patientId = req.params.id;


    // Check if the patient already exists in the database
    const existingPatient = await Patient.findOne({ where: { patientId } });

    if (!existingPatient) {
      return res.status(400).json({ message: 'Patient does not exist' });
    }

    // Update the patient record in the database
    const updatedPatient = await existingPatient.update({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      nationalIDNumber,
      age,
      alternativeContactNumber,
      homeAddress,
      emailAddress,
      nokFirstName,
      nokLastName,
      nokRelationship,
      nokContactNumber,
      nokHomeAddress,
      billingMethodId
    });

    // Create an audit log
    await createAuditLog('Patient', patientId, 'UPDATE', existingPatient.dataValues, updatedPatient.dataValues, req.session.user.userId);

    // Respond with the updated patient object
    return res.status(200).json({ status: 'success', message: 'Patient record updated successfully', data: updatedPatient });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating patient:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch patients
const fetchPatients = async (req, res) => {
  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;

    const filter = {};
    const sort = [];

    if (searchValue) {
      filter[Op.or] = [
        { firstName: { [Op.iLike]: `%${searchValue}%` } },
        { lastName: { [Op.iLike]: `%${searchValue}%` } },
        // Add more columns to search here as needed
      ];
    }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      0: 'patient_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order

    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

    const result = await Patient.findAndCountAll(queryOptions);

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch patient
const fetchPatientById = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (patientId) {
      // If patientId is provided, fetch the specific patient by ID
      const patient = await Patient.findByPk(patientId);

      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      return res.status(200).json({data: patient});
    }

  } catch (error) {
    console.error('Error fetching patient:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch patient by visit id
const fetchPatientByVisitId = async (req, res) => {
  const visitId = req.params.visitId;

  try {

    const filter = {
      visit_id: visitId, // Filter by visit ID
    };

    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      include: [
        {
          model: models.Patient,
          attributes: ['patientId', 'firstName', 'lastName', 'dateOfBirth', 'gender'],
        },
      ],
    };

    const result = await Visit.findOne(queryOptions);

    if (result) {
      // Result found
      return res.status(200).json({
        status: 'success',
        data: result.Patient,
      });
    } else {
      // No result found
      return res.status(404).json({
        status: 'failure',
        message: 'Patient result not found',
      });
    }
  } catch (error) {
    console.error('Error fetching visits:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create a new visit
const createVisit = async (req, res) => {
  try {

    // Convert empty strings to null for nullable fields
    const visitDate = req.body.visitDate || null;
    const visitCategoryId = req.body.visitCategoryId || null;
    const patientId = req.body.patientId || null;
    const doctorId = req.body.doctorId || null;
    // const doctorSpecialityId = req.body.doctorSpecialityId || null;

    const existingVisit = await Visit.findOne({ where: { patientId: patientId, visitDate: visitDate } });
    if (existingVisit) {
      return res.status(400).json({ message: 'Visit already exists' });
    }

    const newVisit = await Visit.create({
      visitDate,
      visitCategoryId,
      patientId,
      doctorId,
      // doctorSpecialityId
    });

    // Create an audit log
    await createAuditLog('Visit', newVisit.visitId, 'CREATE', {}, newVisit.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'Visit record created successfully', data: newVisit });
  } catch (error) {
    console.error('Error creating visit:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch all visits
const fetchVisits = async (req, res) => {

  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;

    const filter = {};

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      0: 'patient_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order

    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
      include: [
        {
          model: models.Doctor,
          attributes: ['firstName', 'lastName'],
        },
        {
          model: models.Patient,
          attributes: ['patientId', 'firstName', 'lastName'],
        },
      ],
    };

    const result = await Visit.findAndCountAll(queryOptions);

    // Access the doctor's fields in each visit result
    const visitsWithDoctorInfo = result.rows.map((visit) => ({
      // Extract fields from the 'doctor' association
      doctorFullName: `${visit.Doctor.firstName} ${visit.Doctor.lastName}`,
      patientId: visit.Patient.patientId,
      patientFullName: `${visit.Patient.firstName} ${visit.Patient.lastName}`,
      visitId: visit.visitId,
      visitCategoryId: visit.visitCategoryId,
      visitDate: visit.visitDate,
      visitStatus: visit.visitStatus,
      visitCreatedAt: visit.createdAt,
    }));

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: visitsWithDoctorInfo,
    });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch visit
const fetchVisitById = async (req, res) => {
  try {
    const visitId = req.params.id;

    if (visitId) {
      // If visitId is provided, fetch the specific visit by ID
      const visit = await Visit.findByPk(visitId);

      if (!visit) {
        return res.status(404).json({ message: 'Visit not found' });
      }
      return res.status(200).json({data: visit});
    }

  } catch (error) {
    console.error('Error fetching visit:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update a visit
const updateVisitById = async (req, res) => {
  try {
    // Extract visit data from the request body

    const visitDate = req.body.visitDate || null;
    const visitCategoryId = req.body.visitCategoryId || null;
    const visitStatus = req.body.visitStatus || null;
    const patientId = req.body.patientId || null;
    const doctorId = req.body.doctorId || null;


    const visitId = req.params.id;


    // Check if the visit already exists in the database
    const existingVisit = await Visit.findOne({ where: { visitId } });

    if (!existingVisit) {
      return res.status(400).json({ message: 'Visit does not exist' });
    }

    // Update the visit record in the database
    const updatedVisit = await existingVisit.update({
      visitDate,
      visitCategoryId,
      visitStatus,
      patientId,
      doctorId
    });

    // Create an audit log
    await createAuditLog('Visit', visitId, 'UPDATE', existingVisit.dataValues, updatedVisit.dataValues, req.session.user.userId);

    // Respond with the updated visit object
    return res.status(200).json({ status: 'success', message: 'Visit record updated successfully', data: updatedVisit });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating visit:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch visit
const fetchVisitsByPatientId = async (req, res) => {
  const patientId = req.params.id;

  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;

    const filter = {
      patient_id: patientId, // Filter by patient ID
    };

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      0: 'patient_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }


    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
      include: [
        {
          model: models.Doctor,
          attributes: ['firstName', 'lastName'],
        }
      ],
    };

    const result = await Visit.findAndCountAll(queryOptions);

    // Access the doctor's fields in each visit result
    const visitsWithDoctorInfo = result.rows.map((visit) => ({
      // Extract fields from the 'doctor' association
      doctorFullName: `${visit.Doctor.firstName} ${visit.Doctor.lastName}`,
      visitId: visit.visitId,
      visitCategoryId: visit.visitCategoryId,
      visitDate: visit.visitDate,
      visitStatus: visit.visitStatus,
      visitCreatedAt: visit.createdAt,
    }));

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: visitsWithDoctorInfo,
    });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add patient to queue
const addPatientToQueue = async (req, res) => {
  try {

    // Convert empty strings to null for nullable fields
    const patientId = req.body.patientId || null;
    const doctorId = req.body.doctorId || null;
    const visitId = req.body.visitId || null;

    // const existingInQueue = await Queue.findOne({ where: { patientId: patientId/*, visitDate: visitDate*/ } });
    // if (existingInQueue) {
    //   return res.status(400).json({ message: 'Patient already exists in queue' });
    // }

    const newPatientToQueue = await Queue.create({
      patientId,
      doctorId,
      visitId
    });

    // Create an audit log
    await createAuditLog('Queue', newPatientToQueue.patientId, 'CREATE', {}, newPatientToQueue.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'Patient added to queue successfully', data: newPatientToQueue });
  } catch (error) {
    console.error('Error adding patient to queue:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch all visits
const fetchAllPatientsOnQueue = async (req, res) => {

  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;

    const filter = {};

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      0: 'patient_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order

    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
      include: [
        {
          model: models.Doctor,
          attributes: ['firstName', 'lastName'],
        },
        {
          model: models.Patient,
          attributes: ['patientId', 'firstName', 'lastName', 'dateOfBirth'],
        }
      ],
    };


    const result = await Queue.findAndCountAll(queryOptions);

    // Access the doctor's fields in each queue result
    const allPatientsOnQueue = result.rows.map((record) => ({
      // Extract fields from the 'doctor' association
      // doctorFirstName: record.Doctor.firstName,
      // doctorLastName: record.Doctor.lastName,

      doctorFullName: `${record.Doctor.firstName} ${record.Doctor.lastName}`,

      patientId: record.Patient.patientId,
      // patientFirstName: record.Patient.firstName,
      // patientLastName: record.Patient.lastName,
      patientFullName: `${record.Patient.firstName} ${record.Patient.lastName}`,
      patientDateOfBirth: record.Patient.dateOfBirth,
      
      queueStatus: record.queueStatus,
      queueCreatedAt: record.createdAt,
    }));

    // console.log(visitsWithDoctorInfo);

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: allPatientsOnQueue,
    });
  } catch (error) {
    console.error('Error fetching patients on queue:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create triage
const createTriage = async (req, res) => {
  try {

    // Convert empty strings to null for nullable fields
    const bloodPressure = req.body.bloodPressure || null;
    const heartRate = req.body.heartRate || null;
    const respiratoryRate = req.body.respiratoryRate || null;
    const signsAndSymptoms = req.body.signsAndSymptoms || null;
    const injuryDetails = req.body.injuryDetails || null;
    const visitId = req.body.visitId || null;
    // const userId = req.body.userId || null;


    const newTriage = await Triage.create({
      bloodPressure,
      heartRate,
      respiratoryRate,
      signsAndSymptoms,
      injuryDetails,
      visitId,
      // userId
    });


    return res.status(201).json({ status: 'success', message: 'Triage record created successfully', data: newTriage });
  } catch (error) {
    console.error('Error creating triage:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update triage
const updateTriageById = async (req, res) => {
  try {
    // Extract triage data from the request body
    // Convert empty strings to null for nullable fields
    const bloodPressure = req.body.bloodPressure || null;
    const heartRate = req.body.heartRate || null;
    const respiratoryRate = req.body.respiratoryRate || null;
    const signsAndSymptoms = req.body.signsAndSymptoms || null;
    const injuryDetails = req.body.injuryDetails || null;

    const triageId = req.params.id;


    // Check if the triage already exists in the database
    const existingTriage = await Triage.findOne({ where: { triageId } });

    if (!existingTriage) {
      return res.status(400).json({ message: 'Triage does not exist' });
    }

    // Update the triage record in the database
    const updatedTriage = await existingTriage.update({
      bloodPressure,
      heartRate,
      respiratoryRate,
      signsAndSymptoms,
      injuryDetails,
      // visitId,
    });

    // Create an audit log
    await createAuditLog('Triage', existingTriage.triageId, 'UPDATE', existingTriage.dataValues, updatedTriage.dataValues, req.session.user.userId);

    // Respond with the updated triage object
    return res.status(200).json({ status: 'success', message: 'Triage record updated successfully', data: updatedTriage });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating triage:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create allergy
const createAllergy = async (req, res) => {
  try {

    // Convert empty strings to null for nullable fields
    const allergies = req.body.allergies || null;
    const visitId = req.body.visitId || null;


    const newAllergy = await Allergy.create({
      allergies,
      visitId,
    });


    return res.status(201).json({ status: 'success', message: 'Allergy record created successfully', data: newAllergy });
  } catch (error) {
    console.error('Error creating allergy:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update allergy
const updateAllergyById = async (req, res) => {
  try {
    // Extract allergy data from the request body
    // Convert empty strings to null for nullable fields
    const allergies = req.body.allergies || null;

    const allergyId = req.params.id;


    // Check if the allergy already exists in the database
    const existingAllergy = await Allergy.findOne({ where: { allergyId } });

    if (!existingAllergy) {
      return res.status(400).json({ message: 'Allergy does not exist' });
    }

    // Update the allergy record in the database
    const updatedAllergy = await existingAllergy.update({
      allergies,
      // visitId,
    });

    // Create an audit log
    await createAuditLog('Allergy', existingAllergy.allergyId, 'UPDATE', existingAllergy.dataValues, updatedAllergy.dataValues, req.session.user.userId);

    // Respond with the updated allergy object
    return res.status(200).json({ status: 'success', message: 'Allergy record updated successfully', data: updatedAllergy });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating allergy:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create clinical request for eye
const createClinicalRequestForEye = async (req, res) => {
  try {
    const {
      visitId,
      targetEye,
      diagnosis,
      serviceFee,
      observationNotes,
      descriptionNotes
    } = req.body;

    const newClinicalRequestForEye = await ClinicalRequestForEye.create({
      visitId,
      targetEye,
      diagnosis,
      serviceFee,
      observationNotes,
      descriptionNotes
    });

    // Create an audit log
    await createAuditLog('ClinicalRequestForEye', newClinicalRequestForEye.resultId, 'CREATE', {}, newClinicalRequestForEye.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'Clinical request for Eye created successfully', data: newClinicalRequestForEye });
  } catch (error) {
    console.error('Error creating Clinical request for Eye:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update clinical request for eye
const updateClinicalRequestForEyeById = async (req, res) => {
  try {
    // Extract request data from the request body
    // Convert empty strings to null for nullable fields
    const targetEye = req.body.targetEye || null;
    const diagnosis = req.body.diagnosis || null;
    const serviceFee = req.body.serviceFee || null;
    const observationNotes = req.body.observationNotes || null;
    const descriptionNotes = req.body.descriptionNotes || null;

    const requestId = req.params.id;


    // Check if the request already exists in the database
    const existingRequest = await ClinicalRequestForEye.findOne({ where: { requestId } });

    if (!existingRequest) {
      return res.status(400).json({ message: 'Eye request does not exist' });
    }

    // Update the request record in the database
    const updatedRequest = await existingRequest.update({
      targetEye,
      diagnosis,
      serviceFee,
      observationNotes,
      descriptionNotes,
      // visitId,
    });

    // Create an audit log
    await createAuditLog('ClinicalRequestForEye', existingRequest.requestId, 'UPDATE', existingRequest.dataValues, updatedRequest.dataValues, req.session.user.userId);

    // Respond with the updated request object
    return res.status(200).json({ status: 'success', message: 'Eye request record updated successfully', data: updatedRequest });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating request:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};






// Middleware
const createIncomeRecord = async (patientId, amount, paymentMethod, narration, userId) => {
  try {
    const incomeRecord = await Income.create({
      patientId,
      amount,
      paymentMethod,
      narration,
      userId,
    });

    return incomeRecord;
  } catch (error) {
    console.error('Error creating income record:', error);
    throw new Error('Error creating income record');
  }
};


const createExpenseRecord = async (req, res) => {
  try {
    const {
      expenseCategory,
      amount,
      paymentMethod,
      narration
    } = req.body;

    const newExpenseRecord = await Expense.create({
      expenseCategory,
      amount,
      paymentMethod,
      narration,
      userId: req.session.user.userId,
    });

    // Create an audit log
    await createAuditLog('Expense', newExpenseRecord.expenseId, 'CREATE', {}, newExpenseRecord.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'Expense record created successfully', data: newExpenseRecord });
  } catch (error) {
    console.error('Error creating expense record:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};





// Update clinical request for eye payment status
const updateClinicalRequestForEyePaymentStatusById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const paymentStatus = req.params.status;

    // Retrieve the visit associated with the ClinicalRequestForEye
    const clinicalRequest = await ClinicalRequestForEye.findByPk(requestId, {
      include: [{ model: Visit, attributes: ['patientId'] }],
    });

    if (!clinicalRequest) {
      return res.status(404).json({
        status: 'failure',
        message: 'Clinical Request For Eye not found',
      });
    }

    const visit = clinicalRequest.Visit;
    const patientId = visit.patientId;
    const amount = clinicalRequest.serviceFee;

    // Create an income record
    const incomeRecord = await createIncomeRecord(
      patientId,
      amount,
      "cash",
      "Payment for Eye service",
      req.session.user.userId
    );

    // Check if the income record was created successfully
    if (!incomeRecord) {
      return res.status(500).json({
        status: 'failure',
        message: 'Error creating income record',
      });
    }

    // Create an audit log
    await createAuditLog('Income', incomeRecord.incomeId, 'CREATE', {}, {incomeRecord}, req.session.user.userId);


    // Then update payment status
    const [updatedCount] = await ClinicalRequestForEye.update(
      { paymentStatus: paymentStatus },
      { where: { requestId: requestId } }
    );

    // Create an audit log
    await createAuditLog('ClinicalRequestForEye', requestId, 'UPDATE', {}, {paymentStatus}, req.session.user.userId);

    if (updatedCount > 0) {
      // Clinical Request For Eye payment status updated successfully
      return res.status(200).json({
        status: 'success',
        message: 'Clinical Request For Eye payment status updated',
      });
    } else {
      // No Clinical Request For Eye found with the given ID
      return res.status(404).json({
        status: 'failure',
        message: 'Clinical Request For Eye not found',
      });
    }
  } catch (error) {
    console.error('Error updating Clinical Request For Eye payment status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create clinical request for dental
const createClinicalRequestForDental = async (req, res) => {
  try {
    const {
      visitId,
      toothType,
      diagnosis,
      procedure,
      serviceFee
    } = req.body;

    const newClinicalRequestForDental = await ClinicalRequestForDental.create({
      visitId,
      toothType,
      diagnosis,
      procedure,
      serviceFee
    });

    // Create an audit log
    await createAuditLog('ClinicalRequestForDental', newClinicalRequestForDental.resultId, 'CREATE', {}, newClinicalRequestForDental.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'Clinical request for Dental created successfully', data: newClinicalRequestForDental });
  } catch (error) {
    console.error('Error creating Clinical request for Dental:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update clinical request for dental
const updateClinicalRequestForDentalById = async (req, res) => {
  try {
    // Extract request data from the request body
    // Convert empty strings to null for nullable fields
    const toothType = req.body.toothType || null;
    const diagnosis = req.body.diagnosis || null;
    const procedure = req.body.procedure || null;
    const serviceFee = req.body.serviceFee || null;

    const requestId = req.params.id;


    // Check if the request already exists in the database
    const existingRequest = await ClinicalRequestForDental.findOne({ where: { requestId } });

    if (!existingRequest) {
      return res.status(400).json({ message: 'Dental request does not exist' });
    }

    // Update the request record in the database
    const updatedRequest = await existingRequest.update({
      toothType,
      diagnosis,
      procedure,
      serviceFee,
      // visitId,
    });

    // Create an audit log
    await createAuditLog('ClinicalRequestForDental', existingRequest.requestId, 'UPDATE', existingRequest.dataValues, updatedRequest.dataValues, req.session.user.userId);

    // Respond with the updated request object
    return res.status(200).json({ status: 'success', message: 'Dental request record updated successfully', data: updatedRequest });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating request:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update clinical request for dental payment status
const updateClinicalRequestForDentalPaymentStatusById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const paymentStatus = req.params.status;

    // Retrieve the visit associated with the ClinicalRequestForDental
    const clinicalRequest = await ClinicalRequestForDental.findByPk(requestId, {
      include: [{ model: Visit, attributes: ['patientId'] }],
    });

    if (!clinicalRequest) {
      return res.status(404).json({
        status: 'failure',
        message: 'Clinical Request For Dental not found',
      });
    }

    const visit = clinicalRequest.Visit;
    const patientId = visit.patientId;
    const amount = clinicalRequest.serviceFee;

    // Create an income record
    const incomeRecord = await createIncomeRecord(
      patientId,
      amount,
      "cash",
      "Payment for Dental service",
      req.session.user.userId
    );

    // Check if the income record was created successfully
    if (!incomeRecord) {
      return res.status(500).json({
        status: 'failure',
        message: 'Error creating income record',
      });
    }

    // Create an audit log
    await createAuditLog('Income', incomeRecord.incomeId, 'CREATE', {}, {incomeRecord}, req.session.user.userId);


    // Then update payment status
    const [updatedCount] = await ClinicalRequestForDental.update(
      { paymentStatus: paymentStatus },
      { where: { requestId: requestId } }
    );

    // Create an audit log
    await createAuditLog('ClinicalRequestForDental', requestId, 'UPDATE', {}, {paymentStatus}, req.session.user.userId);

    if (updatedCount > 0) {
      // Clinical Request For Dental payment status updated successfully
      return res.status(200).json({
        status: 'success',
        message: 'Clinical Request For Dental payment status updated',
      });
    } else {
      // No Clinical Request For Dental found with the given ID
      return res.status(404).json({
        status: 'failure',
        message: 'Clinical Request For Dental not found',
      });
    }
  } catch (error) {
    console.error('Error updating Clinical Request For Dental payment status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create clinical request for cardiology
const createClinicalRequestForCardiology = async (req, res) => {
  try {
    const {
      visitId,
      referralReason,
      currentMedication,
      observationNotes,
      serviceFee
    } = req.body;

    const newClinicalRequestForCardiology = await ClinicalRequestForCardiology.create({
      visitId,
      referralReason,
      currentMedication,
      observationNotes,
      serviceFee
    });

    // Create an audit log
    await createAuditLog('ClinicalRequestForCardiology', newClinicalRequestForCardiology.resultId, 'CREATE', {}, newClinicalRequestForCardiology.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'Clinical request for Cardiology created successfully', data: newClinicalRequestForCardiology });
  } catch (error) {
    console.error('Error creating Clinical request for Cardiology:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update clinical request for cardiology
const updateClinicalRequestForCardiologyById = async (req, res) => {
  try {
    // Extract request data from the request body
    // Convert empty strings to null for nullable fields
    const referralReason = req.body.referralReason || null;
    const currentMedication = req.body.currentMedication || null;
    const observationNotes = req.body.observationNotes || null;
    const serviceFee = req.body.serviceFee || null;

    const requestId = req.params.id;


    // Check if the request already exists in the database
    const existingRequest = await ClinicalRequestForCardiology.findOne({ where: { requestId } });

    if (!existingRequest) {
      return res.status(400).json({ message: 'Cardiology request does not exist' });
    }

    // Update the request record in the database
    const updatedRequest = await existingRequest.update({
      referralReason,
      currentMedication,
      observationNotes,
      serviceFee,
      // visitId,
    });

    // Create an audit log
    await createAuditLog('ClinicalRequestForCardiology', existingRequest.requestId, 'UPDATE', existingRequest.dataValues, updatedRequest.dataValues, req.session.user.userId);

    // Respond with the updated request object
    return res.status(200).json({ status: 'success', message: 'Cardiology request record updated successfully', data: updatedRequest });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating request:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update clinical request for cardiology payment status
const updateClinicalRequestForCardiologyPaymentStatusById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const paymentStatus = req.params.status;

    // Retrieve the visit associated with the ClinicalRequestForCardiology
    const clinicalRequest = await ClinicalRequestForCardiology.findByPk(requestId, {
      include: [{ model: Visit, attributes: ['patientId'] }],
    });

    if (!clinicalRequest) {
      return res.status(404).json({
        status: 'failure',
        message: 'Clinical Request For Cardiology not found',
      });
    }

    const visit = clinicalRequest.Visit;
    const patientId = visit.patientId;
    const amount = clinicalRequest.serviceFee;

    // Create an income record
    const incomeRecord = await createIncomeRecord(
      patientId,
      amount,
      "cash",
      "Payment for Cardiology service",
      req.session.user.userId
    );

    // Check if the income record was created successfully
    if (!incomeRecord) {
      return res.status(500).json({
        status: 'failure',
        message: 'Error creating income record',
      });
    }

    // Create an audit log
    await createAuditLog('Income', incomeRecord.incomeId, 'CREATE', {}, {incomeRecord}, req.session.user.userId);


    // Then update payment status
    const [updatedCount] = await ClinicalRequestForCardiology.update(
      { paymentStatus: paymentStatus },
      { where: { requestId: requestId } }
    );

    // Create an audit log
    await createAuditLog('ClinicalRequestForCardiology', requestId, 'UPDATE', {}, {paymentStatus}, req.session.user.userId);

    if (updatedCount > 0) {
      // Clinical Request For Cardiology payment status updated successfully
      return res.status(200).json({
        status: 'success',
        message: 'Clinical Request For Cardiology payment status updated',
      });
    } else {
      // No Clinical Request For Cardiology found with the given ID
      return res.status(404).json({
        status: 'failure',
        message: 'Clinical Request For Cardiology not found',
      });
    }
  } catch (error) {
    console.error('Error updating Clinical Request For Cardiology payment status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create clinical request for radiology
const createClinicalRequestForRadiology = async (req, res) => {
  try {
    const {
      visitId,
      referralReason,
      currentMedication,
      observationNotes,
      serviceFee
    } = req.body;

    const newClinicalRequestForRadiology = await ClinicalRequestForRadiology.create({
      visitId,
      referralReason,
      currentMedication,
      observationNotes,
      serviceFee
    });

    // Create an audit log
    await createAuditLog('ClinicalRequestForRadiology', newClinicalRequestForRadiology.resultId, 'CREATE', {}, newClinicalRequestForRadiology.dataValues, req.session.user.userId);

    // Emit a server-sent event to all connected clients
    // sse.sendSSEUpdateToAll('Reload');

    // Emit a server-sent event to all clients except the excluded one
    sse.sendSSEUpdateToAllExcept('Reload', res);


    return res.status(201).json({ status: 'success', message: 'Clinical request for Radiology created successfully', data: newClinicalRequestForRadiology });
  } catch (error) {
    console.error('Error creating Clinical request for Radiology:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update clinical request for radiology
const updateClinicalRequestForRadiologyById = async (req, res) => {
  try {
    // Extract request data from the request body
    // Convert empty strings to null for nullable fields
    const referralReason = req.body.referralReason || null;
    const currentMedication = req.body.currentMedication || null;
    const observationNotes = req.body.observationNotes || null;
    const serviceFee = req.body.serviceFee || null;

    const requestId = req.params.id;


    // Check if the request already exists in the database
    const existingRequest = await ClinicalRequestForRadiology.findOne({ where: { requestId } });

    if (!existingRequest) {
      return res.status(400).json({ message: 'Radiology request does not exist' });
    }

    // Update the request record in the database
    const updatedRequest = await existingRequest.update({
      referralReason,
      currentMedication,
      observationNotes,
      serviceFee,
      // visitId,
    });

    // Create an audit log
    await createAuditLog('ClinicalRequestForRadiology', existingRequest.requestId, 'UPDATE', existingRequest.dataValues, updatedRequest.dataValues, req.session.user.userId);

    // Respond with the updated request object
    return res.status(200).json({ status: 'success', message: 'Radiology request record updated successfully', data: updatedRequest });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating request:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update clinical request for radiology payment status
const updateClinicalRequestForRadiologyPaymentStatusById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const paymentStatus = req.params.status;

    // Retrieve the visit associated with the ClinicalRequestForRadiology
    const clinicalRequest = await ClinicalRequestForRadiology.findByPk(requestId, {
      include: [{ model: Visit, attributes: ['patientId'] }],
    });

    if (!clinicalRequest) {
      return res.status(404).json({
        status: 'failure',
        message: 'Clinical Request For Radiology not found',
      });
    }

    const visit = clinicalRequest.Visit;
    const patientId = visit.patientId;
    const amount = clinicalRequest.serviceFee;

    // Create an income record
    const incomeRecord = await createIncomeRecord(
      patientId,
      amount,
      "cash",
      "Payment for Radiology service",
      req.session.user.userId
    );

    // Check if the income record was created successfully
    if (!incomeRecord) {
      return res.status(500).json({
        status: 'failure',
        message: 'Error creating income record',
      });
    }

    // Create an audit log
    await createAuditLog('Income', incomeRecord.incomeId, 'CREATE', {}, {incomeRecord}, req.session.user.userId);


    // Then update payment status
    const [updatedCount] = await ClinicalRequestForRadiology.update(
      { paymentStatus: paymentStatus },
      { where: { requestId: requestId } }
    );

    // Create an audit log
    await createAuditLog('ClinicalRequestForRadiology', requestId, 'UPDATE', {}, {paymentStatus}, req.session.user.userId);

    if (updatedCount > 0) {
      // Clinical Request For Radiology payment status updated successfully
      return res.status(200).json({
        status: 'success',
        message: 'Clinical Request For Radiology payment status updated',
      });
    } else {
      // No Clinical Request For Radiology found with the given ID
      return res.status(404).json({
        status: 'failure',
        message: 'Clinical Request For Radiology not found',
      });
    }
  } catch (error) {
    console.error('Error updating Clinical Request For Radiology payment status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch medical history
const fetchMedicalHistoryByVisitId = async (req, res) => {
  const visitId = req.params.visitId;

  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;



    const filter = {
      visit_id: visitId,
    };

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      // 0: 'patient_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order

    const allergyQuery = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

    const triageQuery = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

     // Construct the Sequelize query
    const labRequestQuery = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
      include: [
        {
          model: models.LabTest,
          attributes: ['testName', 'testFees'],
        },
      ],
    };

    const clinicalEyeQuery = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

    const clinicalCardiologyQuery = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

    const clinicalRadiologyQuery = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

    const clinicalDentalQuery = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

    // Use Promise.all to concurrently fetch data from multiple models
    const [allergyResult, triageResult, labRequestResult, eyeResult, cardiologyResult, radiologyResult, dentalResult] = await Promise.all([
      Allergy.findAndCountAll(allergyQuery),
      Triage.findAndCountAll(triageQuery),
      LabRequest.findAndCountAll(labRequestQuery),
      ClinicalRequestForEye.findAndCountAll(clinicalEyeQuery),
      ClinicalRequestForCardiology.findAndCountAll(clinicalCardiologyQuery),
      ClinicalRequestForRadiology.findAndCountAll(clinicalRadiologyQuery),
      ClinicalRequestForDental.findAndCountAll(clinicalDentalQuery),
    ]);

    // Access the fields from Allergy result
    const allergyResults = allergyResult.rows.map((request) => ({
      // Used on table
      requestName: "Allergy",
      requestFees: "N/A",
      requestId: request.allergyId,
      requestStatus: "N/A",
      requestCreatedAt: request.createdAt,
      requestType: 'allergy',

      // Used on form
      allergies: request.allergies,
      visitId: request.visitId,
    }));

    // Access the fields from Triage result
    const triageResults = triageResult.rows.map((request) => ({
      // Used on table
      requestName: "Triage",
      requestFees: "N/A",
      requestId: request.triageId,
      requestStatus: "N/A",
      requestCreatedAt: request.createdAt,
      requestType: 'triage',

      // Used on form
      bloodPressure: request.bloodPressure,
      heartRate: request.heartRate,
      respiratoryRate: request.respiratoryRate,
      signsAndSymptoms: request.signsAndSymptoms,
      injuryDetails: request.injuryDetails,
      visitId: request.visitId,
    }));

    // Access the lab test's fields in each LabRequest result
    const labRequestsWithTestResults = labRequestResult.rows.map((request) => ({
      // Used on table
      requestName: request.LabTest.testName,
      // This fees if from Lab tests
      // requestFees: request.LabTest.testFees,
      // This fees is from Lab requests
      // requestFees: request.testFees,
      requestFees: request.testFees || request.LabTest.testFees,
      requestId: request.requestId,
      requestStatus: request.requestStatus,
      requestCreatedAt: request.createdAt,
      requestType: 'test',

      // Used on form
      visitId: request.visitId,
    }));

    // Access fields from ClinicalRequestForEye results
    const clinicalEyeResults = eyeResult.rows.map((request) => ({
      // Used on table
      requestName: 'Eye Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      requestStatus: "Pending",
      requestCreatedAt: request.createdAt,
      requestType: 'service',

      // Used on form
      targetEye: request.targetEye,
      diagnosis: request.diagnosis,
      serviceFee: request.serviceFee,
      observationNotes: request.observationNotes,
      descriptionNotes: request.descriptionNotes,
      visitId: request.visitId,
    }));

    // Access fields from ClinicalRequestForCardiology results
    const clinicalCardiologyResults = cardiologyResult.rows.map((request) => ({
      // Used on table
      requestName: 'Cardiology Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      requestStatus: "Pending",
      requestCreatedAt: request.createdAt,
      requestType: 'service',

      // Used on form
      referralReason: request.referralReason,
      currentMedication: request.currentMedication,
      observationNotes: request.observationNotes,
      serviceFee: request.serviceFee,
      visitId: request.visitId,
    }));

    // Access fields from ClinicalRequestForRadiology results
    const clinicalRadiologyResults = radiologyResult.rows.map((request) => ({
      // Used on table
      requestName: 'Radiology Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      requestStatus: "Pending",
      requestCreatedAt: request.createdAt,
      requestType: 'service',

      // Used on form
      referralReason: request.referralReason,
      currentMedication: request.currentMedication,
      observationNotes: request.observationNotes,
      serviceFee: request.serviceFee,
      visitId: request.visitId,
    }));

    // Access fields from ClinicalRequestForDental results
    const clinicalDentalResults = dentalResult.rows.map((request) => ({
      // Used of table
      requestName: 'Dental Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      requestStatus: "Pending",
      requestCreatedAt: request.createdAt,
      requestType: 'service',

      // Used on form
      toothType: request.toothType,
      diagnosis: request.diagnosis,
      procedure: request.procedure,
      serviceFee: request.serviceFee,
      visitId: request.visitId,
    }));

    // Combine results from all models
    const allResults = [...allergyResults, ...triageResults, ...labRequestsWithTestResults, ...clinicalEyeResults, ...clinicalCardiologyResults, ...clinicalRadiologyResults, ...clinicalDentalResults];

    return res.status(200).json({
      draw: draw,
      recordsTotal: allResults.length,
      recordsFiltered: allResults.length,
      data: allResults,
    });

  } catch (error) {
    console.error('Error fetching medical records:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create new CBC results
const createResultsForCompleteBloodCountTest = async (req, res) => {
  try {
    // Convert empty strings to null for nullable fields
    const {
      whiteBloodCellCount,
      lymphocyteAbsolute,
      mid,
      gran,
      lymphocytePercentage,
      midPercentage,
      granPercentage,
      haemoglobin,
      redBloodCellCount,
      packedCellVolume,
      meanCellVolume,
      meanCellHaemoglobin,
      mchc,
      rdwCv,
      rdwSd,
      plateleteCount,
      mpv,
      pwd,
      pct,
      erythrocyteSedimentationRate,
      requestId,
      comment,
    } = req.body;

    const newCompleteBloodCountResults = await LabResultForCompleteBloodCount.create({
      whiteBloodCellCount,
      lymphocyteAbsolute,
      mid,
      gran,
      lymphocytePercentage,
      midPercentage,
      granPercentage,
      haemoglobin,
      redBloodCellCount,
      packedCellVolume,
      meanCellVolume,
      meanCellHaemoglobin,
      mchc,
      rdwCv,
      rdwSd,
      plateleteCount,
      mpv,
      pwd,
      pct,
      erythrocyteSedimentationRate,
      requestId,
      comment,
    });

    // Update request status on lab requests
    await LabRequest.update(
      { requestStatus: 'complete' },
      { where: { requestId: requestId } }
    );

    // Create an audit log
    await createAuditLog('LabResultForCompleteBloodCount', newCompleteBloodCountResults.resultId, 'CREATE', {}, newCompleteBloodCountResults.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'CBC results created successfully', data: newCompleteBloodCountResults });
  } catch (error) {
    console.error('Error creating CBC results:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch CBC results by id
const fetchResultsForCompleteBloodCountTestByRequestId = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    // Sequelize query
    const queryOptions = {
      where: { request_id: requestId }
    };

    const result = await LabResultForCompleteBloodCount.findOne(queryOptions);

    if (result) {
      // Result found
      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } else {
      // No result found
      return res.status(404).json({
        status: 'failure',
        message: 'CBC result not found',
      });
    }

  } catch (error) {
    console.error('Error fetching result:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create new Urinalysis results
const createResultsForUrinalysisTest = async (req, res) => {
  try {
    // Convert empty strings to null for nullable fields
    const {
      appearance,
      glucose,
      ketone,
      blood,
      ph,
      protein,
      nitrites,
      leucocytes,
      urobilinogen,
      bilirubin,
      specificGravity,
      rbc,
      pusCells,
      epithelialCells,
      cast,
      wbc,
      parasite,
      crystals,
      tVaginalis,
      yeastCells,
      requestId,
      comment,
    } = req.body;

    const newUrinalysisResults = await LabResultForUrinalysis.create({
      appearance,
      glucose,
      ketone,
      blood,
      ph,
      protein,
      nitrites,
      leucocytes,
      urobilinogen,
      bilirubin,
      specificGravity,
      rbc,
      pusCells,
      epithelialCells,
      cast,
      wbc,
      parasite,
      crystals,
      tVaginalis,
      yeastCells,
      requestId,
      comment,
    });

    // Update request status on lab requests
    await LabRequest.update(
      { requestStatus: 'complete' },
      { where: { requestId: requestId } }
    );

    // Create an audit log
    await createAuditLog('LabResultForUrinalysis', newUrinalysisResults.resultId, 'CREATE', {}, newUrinalysisResults.dataValues, req.session.user.userId);

    return res.status(201).json({ status: 'success', message: 'Urinalysis results created successfully', data: newUrinalysisResults });
  } catch (error) {
    console.error('Error creating Urinalysis results:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch Urinalysis results by id
const fetchResultsForUrinalysisTestByRequestId = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    // Sequelize query
    const queryOptions = {
      where: { request_id: requestId }
    };

    const result = await LabResultForUrinalysis.findOne(queryOptions);

    if (result) {
      console.log(result)
      // Result found
      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } else {
      // No result found
      return res.status(404).json({
        status: 'failure',
        message: 'Urinalysis result not found',
      });
    }

  } catch (error) {
    console.error('Error fetching result:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};






const fetchBillsByVisitId = async (req, res) => {
  try {

    const visitId = req.params.visitId;

    // Construct the Sequelize query
    const labRequestQuery = {
      where: { visit_id: visitId },
      include: [
        {
          model: models.LabTest,
          attributes: ['testName', 'testFees'],
        },
      ],
    };

    const clinicalEyeQuery = {
      where: { visit_id: visitId }
    };

    const clinicalCardiologyQuery = {
      where: { visit_id: visitId }
    };

    const clinicalRadiologyQuery = {
      where: { visit_id: visitId }
    };

    const clinicalDentalQuery = {
      where: { visit_id: visitId }
    };

    // Use Promise.all to concurrently fetch data from multiple models
    const [labRequestResult, eyeResult, cardiologyResult, radiologyResult, dentalResult] = await Promise.all([
      LabRequest.findAndCountAll(labRequestQuery),
      ClinicalRequestForEye.findAndCountAll(clinicalEyeQuery),
      ClinicalRequestForCardiology.findAndCountAll(clinicalCardiologyQuery),
      ClinicalRequestForRadiology.findAndCountAll(clinicalRadiologyQuery),
      ClinicalRequestForDental.findAndCountAll(clinicalDentalQuery),
    ]);


    // Access the lab test's fields in each LabRequest result
    const labRequestsWithTestResults = labRequestResult.rows.map((request) => ({
      requestName: request.LabTest.testName,
      requestFees: request.testFees || request.LabTest.testFees,
      requestId: request.requestId,
      paymentStatus: request.paymentStatus,
    }));

    // Access fields from ClinicalRequestForEye results
    const clinicalEyeResults = eyeResult.rows.map((request) => ({
      requestName: 'Eye Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      paymentStatus: request.paymentStatus,
    }));

    // Access fields from ClinicalRequestForCardiology results
    const clinicalCardiologyResults = cardiologyResult.rows.map((request) => ({
      requestName: 'Cardiology Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      paymentStatus: request.paymentStatus,
    }));

    // Access fields from ClinicalRequestForRadiology results
    const clinicalRadiologyResults = radiologyResult.rows.map((request) => ({
      requestName: 'Radiology Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      paymentStatus: request.paymentStatus,
    }));

    // Access fields from ClinicalRequestForDental results
    const clinicalDentalResults = dentalResult.rows.map((request) => ({
      requestName: 'Dental Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      paymentStatus: request.paymentStatus,
    }));

    // Combine results from all models
    const allResults = [...labRequestsWithTestResults, ...clinicalEyeResults, ...clinicalCardiologyResults, ...clinicalRadiologyResults, ...clinicalDentalResults];


    if (allResults) {
      // Results found
      return res.status(200).json({
        status: 'success',
        data: allResults,
      });
    } else {
      // No result found
      return res.status(404).json({
        status: 'failure',
        message: 'Diagnosis bill not found',
      });
    }

  } catch (error) {
    console.error('Error fetching bills:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const fetchUnpaidBillsByVisitId = async (req, res) => {
    try {

    const visitId = req.params.visitId;

    // Construct the Sequelize query
    const labRequestQuery = {
      where: { visit_id: visitId, payment_status: 'unpaid' },
      include: [
        {
          model: models.LabTest,
          attributes: ['testName', 'testFees'],
        },
      ],
    };

    const clinicalEyeQuery = {
      where: { visit_id: visitId, payment_status: 'unpaid' }
    };

    const clinicalCardiologyQuery = {
      where: { visit_id: visitId, payment_status: 'unpaid' }
    };

    const clinicalRadiologyQuery = {
      where: { visit_id: visitId, payment_status: 'unpaid' }
    };

    const clinicalDentalQuery = {
      where: { visit_id: visitId, payment_status: 'unpaid' }
    };

    // Use Promise.all to concurrently fetch data from multiple models
    const [labRequestResult, eyeResult, cardiologyResult, radiologyResult, dentalResult] = await Promise.all([
      LabRequest.findAndCountAll(labRequestQuery),
      ClinicalRequestForEye.findAndCountAll(clinicalEyeQuery),
      ClinicalRequestForCardiology.findAndCountAll(clinicalCardiologyQuery),
      ClinicalRequestForRadiology.findAndCountAll(clinicalRadiologyQuery),
      ClinicalRequestForDental.findAndCountAll(clinicalDentalQuery),
    ]);


    // Access the lab test's fields in each LabRequest result
    const labRequestsWithTestResults = labRequestResult.rows.map((request) => ({
      requestName: request.LabTest.testName,
      requestFees: request.testFees || request.LabTest.testFees,
      requestId: request.requestId,
      paymentStatus: request.paymentStatus,
    }));

    // Access fields from ClinicalRequestForEye results
    const clinicalEyeResults = eyeResult.rows.map((request) => ({
      requestName: 'Eye Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      paymentStatus: "Pending",
    }));

    // Access fields from ClinicalRequestForCardiology results
    const clinicalCardiologyResults = cardiologyResult.rows.map((request) => ({
      requestName: 'Cardiology Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      requestStatus: "Pending",
    }));

    // Access fields from ClinicalRequestForRadiology results
    const clinicalRadiologyResults = radiologyResult.rows.map((request) => ({
      requestName: 'Radiology Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      requestStatus: "Pending",
    }));

    // Access fields from ClinicalRequestForDental results
    const clinicalDentalResults = dentalResult.rows.map((request) => ({
      requestName: 'Dental Service',
      requestFees: request.serviceFee,
      requestId: request.requestId,
      requestStatus: "Pending",
    }));

    // Combine results from all models
    const allResults = [...labRequestsWithTestResults, ...clinicalEyeResults, ...clinicalCardiologyResults, ...clinicalRadiologyResults, ...clinicalDentalResults];


    if (allResults) {
      // Results found
      return res.status(200).json({
        status: 'success',
        data: allResults,
      });
    } else {
      // No result found
      return res.status(404).json({
        status: 'failure',
        message: 'Diagnosis bill not found',
      });
    }

  } catch (error) {
    console.error('Error fetching bills:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
  // try {

  //   const visitId = req.params.visitId;

  //   // Construct the Sequelize query
  //   const queryOptions = {
  //     where: { visit_id: visitId, payment_status: "unpaid" },
  //     include: [
  //       {
  //         model: models.LabTest,
  //         attributes: ['testName', 'testFees'],
  //       },
  //     ],
  //   };

  //   const result = await LabRequest.findAndCountAll(queryOptions);

  //   // Access the lab test's fields in each request result
  //   const requestsWithTestResults = result.rows.map((request) => ({
  //     // Extract fields from the 'LabTest' model
  //     requestId: request.requestId,
  //     testName: request.LabTest.testName,
  //     testFees: request.testFees || request.LabTest.testFees,
  //   }));

    

  //   if (result) {
  //     // Results found
  //     return res.status(200).json({
  //       status: 'success',
  //       data: requestsWithTestResults,
  //     });
  //   } else {
  //     // No result found
  //     return res.status(404).json({
  //       status: 'failure',
  //       message: 'Diagnosis bill not found',
  //     });
  //   }

  // } catch (error) {
  //   console.error('Error fetching bills:', error);
  //   return res.status(500).json({ message: 'Internal Server Error' });
  // }
};

// Fetch tests
const fetchTests = async (req, res) => {
  try {
    const result = await LabTest.findAndCountAll();

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch medicines
const fetchMedicines = async (req, res) => {
  try {
    const result = await Medicine.findAndCountAll();

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create lab request 
const createLabRequest = async (req, res) => {
  try {
    // Convert empty strings to null for nullable fields
    const labRequest = req.body;

    // Empty array to store the new lab requests
    const newLabRequests = [];

    // Iterate over the lab requests array and insert each object as a separate record
    for (const request of labRequest) {
      const newRequest = await LabRequest.create({
        testId: request.testId,
        visitId: request.visitId,
        testFees: request.testFees,
        clinicalNotes: request.clinicalNotes,
      });

      // Add the new request to the newLabRequests array.
      newLabRequests.push(newRequest);
    }

    return res.status(201).json({ status: 'success', message: 'Lab request request records created successfully', data: newLabRequests });
  } catch (error) {
    console.error('Error creating Lab request request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Update lab request
const updateLabRequestById = async (req, res) => {
  try {
    // Extract request data from the request body
    // Convert empty strings to null for nullable fields
    const requestFees = req.body.requestFees || null;

    const requestId = req.params.id;


    // Check if the request already exists in the database
    const existingRequest = await LabRequest.findOne({ where: { requestId } });

    if (!existingRequest) {
      return res.status(400).json({ message: 'Lab request request does not exist' });
    }

    // Update the request record in the database
    const updatedRequest = await existingRequest.update({
      testFees: requestFees,
      // visitId,
    });

    // Create an audit log
    // await createAuditLog('LabRequest', existingRequest.requestId, 'UPDATE', existingRequest.dataValues, updatedRequest.dataValues, req.session.user.userId);

    // Respond with the updated request object
    return res.status(200).json({ status: 'success', message: 'Lab request request record updated successfully', data: updatedRequest });

  } catch (error) {
    // Log out the error to the console
    console.error('Error updating request:', error);

    // Respond with the error to the client
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};



// Fetch lab requests
const fetchLabRequestsByVisitId = async (req, res) => {
  const visitId = req.params.visitId;

  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;



    const filter = {
      visit_id: visitId,
    };

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      // 0: 'patient_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order


     // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
      include: [
        {
          model: models.LabTest,
          attributes: ['testName', 'testFees'],
        },
      ],
    };

    const result = await LabRequest.findAndCountAll(queryOptions);

    // Access the lab test's fields in each request result
    const requestsWithTestResults = result.rows.map((request) => ({
      // Extract fields from the 'LabTest' model
      testName: request.LabTest.testName,
      testFees: request.LabTest.testFees,
      requestId: request.requestId,
      requestStatus: request.requestStatus,
      requestCreatedAt: request.createdAt,
    }));

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: requestsWithTestResults,
    });

  } catch (error) {
    console.error('Error fetching lab requests:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update lab request payment status
const updateLabRequestPaymentStatus = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const paymentStatus = req.params.status;

    const [updatedCount] = await LabRequest.update(
      { paymentStatus: paymentStatus },
      { where: { requestId: requestId } }
    );

    // Create an audit log
    await createAuditLog('LabRequest', requestId, 'UPDATE', {}, {paymentStatus}, req.session.user.userId);

    if (updatedCount > 0) {
      // Lab request payment status updated successfully
      return res.status(200).json({
        status: 'success',
        message: 'Lab request payment status updated',
      });
    } else {
      // No lab request found with the given ID
      return res.status(404).json({
        status: 'failure',
        message: 'Lab request not found',
      });
    }
  } catch (error) {
    console.error('Error updating lab request payment status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Create prescription
const createPrescription = async (req, res) => {
  try {
    // Convert empty strings to null for nullable fields
    const medicalPrescription = req.body;

    // Empty array to store the new prescription
    const newMedicalPrescriptions = [];

    // Iterate over the prescriptions array and insert each object as a separate record
    for (const prescription of medicalPrescription) {
      const newPrescription = await Prescription.create({
        visitId: prescription.visitId,
        medicineId: prescription.medicineId,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
      });

      // Add the new request to the newMedicalPrescriptions array.
      newMedicalPrescriptions.push(newPrescription);
    }
    return res.status(201).json({ status: 'success', message: 'Prescription records created successfully', data: newMedicalPrescriptions });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch prescriptions by visit id
const fetchPrescriptionsByVisitId = async (req, res) => {
  const visitId = req.params.visitId;

  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;



    const filter = {
      visit_id: visitId,
    };

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      // 0: 'patient_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order


     // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
      include: [
        {
          model: models.Medicine,
          attributes: ['medicineName', 'medicineType', 'dosage', 'manufacturer'],
        },
        {
          model: models.Visit,
        },
      ],
    };

    const result = await Prescription.findAndCountAll(queryOptions);

    // Access the medicine's fields in each prescription result
    const prescriptionWithMedicineResults = result.rows.map((prescription) => ({
      // Extract fields from the 'Medicine' model
      medicineName: prescription.Medicine.medicineName,
      medicineType: prescription.Medicine.medicineType,
      medicineDosage: prescription.Medicine.dosage,
      manufacturer: prescription.Medicine.manufacturer,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      prescriptionCreatedAt: prescription.createdAt,
    }));

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: prescriptionWithMedicineResults,
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Fetch audit logs
const fetchAuditLogs = async (req, res) => {
  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;

    const filter = {};

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      0: 'audit_log_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order

    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
      include: [
        {
          model: models.User,
          attributes: ['username'],
        },
      ],
    };

    const result = await AuditLog.findAndCountAll(queryOptions);

    // Access the user's fields in each audit log result
    const auditLogsWithUserData = result.rows.map((auditLog) => ({
      // Extract fields from the 'user' association
      auditLogCreatedAt: auditLog.createdAt,
      username: auditLog.User.username,
      auditLogAction: auditLog.action,
      auditLogEntity: auditLog.entityName,
    }));

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: auditLogsWithUserData,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Fetch income
const fetchIncome = async (req, res) => {
  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;

    const filter = {};

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      0: 'income_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order

    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

    const result = await Income.findAndCountAll(queryOptions);

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching income data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Fetch expenses
const fetchExpenses = async (req, res) => {
  try {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;
    const orderColumnIndex = req.query.order[0].column;
    const orderDirection = req.query.order[0].dir;
    const minDate = req.query.minDate;
    const maxDate = req.query.maxDate;

    const filter = {};

    const sort = [];

    // if (searchValue) {
    //   filter[Op.or] = [
    //     { patientId: { [Op.iLike]: `%${searchValue}%` } },
    //     // { lastName: { [Op.iLike]: `%${searchValue}%` } },
    //     // Add more columns to search here as needed
    //   ];
    // }

    if (minDate && maxDate) {
      filter.createdAt = {
        [Op.between]: [new Date(minDate), new Date(maxDate)],
      };
    }

    // Define the column mappings for sorting
    const columnMappings = {
      0: 'expense_id', // Map column 0 to the 'id' column
      // Add mappings for other columns as needed
    };

    // Check if the column index is valid and get the column name
    const columnData = columnMappings[orderColumnIndex];
    if (columnData) {
      sort.push([columnData, orderDirection]);
    }

    // Add sorting by createdAt in descending order (latest first)
    // sort.push(['id', 'desc']); // This line will sort by createdAt in descending order

    // Construct the Sequelize query
    const queryOptions = {
      where: filter,
      offset: start,
      limit: length,
      order: sort,
    };

    const result = await Expense.findAndCountAll(queryOptions);

    return res.status(200).json({
      draw: draw,
      recordsTotal: result.count,
      recordsFiltered: result.count,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching expenses data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};





module.exports = { 
  checkAPIStatus, 
  createUser, 
  createDoctor, 
  fetchDoctorByUserId,
  updateDoctor,
  fetchUsers,
  createPatient, 
  updatePatient,
  fetchPatients, 
  fetchPatientById, 
  fetchPatientByVisitId, 
  createVisit, 
  fetchVisits, 
  fetchVisitById,
  updateVisitById,
  fetchVisitsByPatientId, 
  addPatientToQueue, 
  fetchAllPatientsOnQueue, 
  createTriage, 
  updateTriageById,
  createAllergy, 
  updateAllergyById,
  createClinicalRequestForEye,
  updateClinicalRequestForEyeById,
  updateClinicalRequestForEyePaymentStatusById,
  createClinicalRequestForDental,
  updateClinicalRequestForDentalById,
  updateClinicalRequestForDentalPaymentStatusById,
  createClinicalRequestForCardiology,
  updateClinicalRequestForCardiologyById,
  updateClinicalRequestForCardiologyPaymentStatusById,
  createClinicalRequestForRadiology,
  updateClinicalRequestForRadiologyById,
  updateClinicalRequestForRadiologyPaymentStatusById,
  fetchLabRequestsByVisitId, 
  updateLabRequestPaymentStatus,
  fetchMedicalHistoryByVisitId, 
  createResultsForCompleteBloodCountTest, 
  fetchResultsForCompleteBloodCountTestByRequestId, 
  createResultsForUrinalysisTest,
  fetchResultsForUrinalysisTestByRequestId,
  fetchTests, 
  fetchMedicines,
  createLabRequest,
  updateLabRequestById,
  fetchBillsByVisitId, 
  fetchUnpaidBillsByVisitId,
  createPrescription,
  fetchPrescriptionsByVisitId,
  fetchAuditLogs,
  fetchIncome,
  createExpenseRecord,
  fetchExpenses,
};
