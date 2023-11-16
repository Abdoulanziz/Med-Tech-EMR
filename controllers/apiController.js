const Sequelize = require('sequelize');
const models = require('../models');

const { 
  User,
  Patient,
  Visit,
  Queue,
  Triage,
  Allergy,
  LabTest,
  Medicine,
  LabRequest,
  LabResultForCompleteBloodCount,
  LabResultForUrinalysis
} = require('../models');


const Op = Sequelize.Op;

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

    // Create a new user record in the database
    const newUser = await User.create({ username, password, roleId });

    // Respond with the newly created user object
    return res.status(201).json(newUser);

  } catch (error) {
    // Log out the error to the console
    console.error('Error creating user:', error);

    // Respond with the error to the client
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
      emailAddress,
      nokFirstName,
      nokLastName,
      nokRelationship,
      nokContactNumber,
      nokHomeAddress,
      billingMethodId,
    });

    return res.status(201).json({ status: 'success', message: 'Patient record created successfully', data: newPatient });
  } catch (error) {
    console.error('Error creating patient:', error);
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

    // // Add sorting by createdAt in descending order (latest first)
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
    console.error('Error fetching patients:', error);
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

    // // Add sorting by createdAt in descending order (latest first)
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
          attributes: ['firstName', 'lastName'],
        },
      ],
    };

    const result = await Visit.findAndCountAll(queryOptions);

    // Access the doctor's fields in each visit result
    const visitsWithDoctorInfo = result.rows.map((visit) => ({
      // Extract fields from the 'doctor' association
      // doctorFirstName: visit.Doctor.firstName,
      // doctorLastName: visit.Doctor.lastName,
      doctorFullName: `${visit.Doctor.firstName} ${visit.Doctor.lastName}`,
      // patientFirstName: visit.Patient.firstName,
      // patientLastName: visit.Patient.lastName,
      patientFullName: `${visit.Patient.firstName} ${visit.Patient.lastName}`,
      visitId: visit.visitId,
      visitCategoryId: visit.visitCategoryId,
      visitDate: visit.visitDate,
      visitCreatedAt: visit.createdAt,
    }));

    // console.log(visitsWithDoctorInfo);

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
        },
        {
          model: models.Patient,
          attributes: ['firstName', 'lastName'],
        },
      ],
    };

    const result = await Visit.findAndCountAll(queryOptions);

    // Access the doctor's fields in each visit result
    const visitsWithDoctorInfo = result.rows.map((visit) => ({
      // Extract fields from the 'doctor' association
      // doctorFirstName: visit.Doctor.firstName,
      // doctorLastName: visit.Doctor.lastName,
      doctorFullName: `${visit.Doctor.firstName} ${visit.Doctor.lastName}`,
      // patientFirstName: visit.Patient.firstName,
      // patientLastName: visit.Patient.lastName,
      visitId: visit.visitId,
      visitCategoryId: visit.visitCategoryId,
      visitDate: visit.visitDate,
      visitCreatedAt: visit.createdAt,
    }));

    // console.log(visitsWithDoctorInfo);

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

    // // Add sorting by createdAt in descending order (latest first)
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

// Create a new triage
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

// Create a new allergy
const createAllergy = async (req, res) => {
  try {

    // Convert empty strings to null for nullable fields
    const allergies = req.body.allergies || null;
    const visitId = req.body.visitId || null;


    const newAllergy = await Allergy.create({
      allergies,
      visitId,
      // userId
    });


    return res.status(201).json({ status: 'success', message: 'Allergy record created successfully', data: newAllergy });
  } catch (error) {
    console.error('Error creating allergy:', error);
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

    // // Add sorting by createdAt in descending order (latest first)
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

    console.log(req.body);

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

    console.log(newUrinalysisResults)

    // Update request status on lab requests
    await LabRequest.update(
      { requestStatus: 'complete' },
      { where: { requestId: requestId } }
    );

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
    const queryOptions = {
      where: { visit_id: visitId },
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
      requestId: request.requestId,
      paymentStatus: request.paymentStatus,
      testName: request.LabTest.testName,
      testFees: request.LabTest.testFees,
    }));

    

    if (result) {
      // Results found
      return res.status(200).json({
        status: 'success',
        data: requestsWithTestResults,
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
    const queryOptions = {
      where: { visit_id: visitId, payment_status: "unpaid" },
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
      requestId: request.requestId,
      testName: request.LabTest.testName,
      testFees: request.LabTest.testFees,
    }));

    

    if (result) {
      // Results found
      return res.status(200).json({
        status: 'success',
        data: requestsWithTestResults,
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

// // Create lab request for CBC
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
    return res.status(201).json({ status: 'success', message: 'CBC request records created successfully', data: newLabRequests });
  } catch (error) {
    console.error('Error creating CBC request:', error);
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

    // // Add sorting by createdAt in descending order (latest first)
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
    console.error('Error fetching visits:', error);
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





module.exports = { 
  checkAPIStatus, 
  createUser, 
  createPatient, 
  fetchPatients, 
  fetchPatientById, 
  fetchPatientByVisitId, 
  createVisit, 
  fetchVisits, 
  fetchVisitsByPatientId, 
  addPatientToQueue, 
  fetchAllPatientsOnQueue, 
  createTriage, 
  createAllergy, 
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
  fetchBillsByVisitId, 
  fetchUnpaidBillsByVisitId,
};
