const express = require("express");
const router = express.Router();

const { checkAPIStatus, createUser, createPatient, /*createDoctor, createAppointment,*/ fetchPatients, fetchPatient, createVisit, fetchVisits, fetchVisitsByPatientId, fetchPatientByVisitId, addPatientToQueue, fetchAllPatientsOnQueue, createTriage, createAllergy, fetchLabRequestsByVisitId, fetchMedicalHistoryByVisitId, createDiagnoses, fetchAllDiagnosisBillsByVisitId, createDiagnosisReport, fetchDiagnosisReportByDiagnosisId, fetchTests, createLabRequest } = require("../controllers/apiController");

router.get("/status", checkAPIStatus);

router.post("/users", createUser);
router.post("/patients", createPatient);
// router.post("/doctors", createDoctor);
// router.post("/appointments", createAppointment);

router.get("/patients", fetchPatients);
router.get("/patients/:id", fetchPatient);


router.post("/visits", createVisit);
router.get("/visits", fetchVisits);
router.get("/visits/:id", fetchVisitsByPatientId);

router.get("/visit/:id/patient", fetchPatientByVisitId);

router.get("/requests/:visitId", fetchLabRequestsByVisitId);
router.get("/history/:visitId", fetchMedicalHistoryByVisitId);

router.post("/queues", addPatientToQueue);
router.get("/queues", fetchAllPatientsOnQueue);

router.post("/triage", createTriage);

router.post("/allergy", createAllergy);

router.post("/diagnoses", createDiagnoses);
router.get("/diagnoses/bill/:visitId", fetchAllDiagnosisBillsByVisitId);

router.post("/requests", createLabRequest);

router.post("/reports", createDiagnosisReport);
router.get("/reports/:diagnosisId", fetchDiagnosisReportByDiagnosisId);

router.get("/tests", fetchTests);


module.exports = router;