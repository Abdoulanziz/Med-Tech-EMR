const express = require("express");
const router = express.Router();

const { checkAPIStatus, createUser, createPatient, /*createDoctor, createAppointment,*/ fetchPatients, fetchPatient, createVisit, fetchVisits, fetchVisitsByPatientId, fetchPatientByVisitId, addPatientToQueue, fetchAllPatientsOnQueue, createTriage, createAllergy, fetchLabRequestsByVisitId, fetchMedicalHistoryByVisitId, createDiagnoses, fetchAllDiagnosisBillsByVisitId, createResultsForCompleteBloodCountTest, fetchDiagnosisReportByDiagnosisId, fetchTests, createLabRequest } = require("../controllers/apiController");

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

router.post("/queues", addPatientToQueue);
router.get("/queues", fetchAllPatientsOnQueue);

router.post("/triage", createTriage);
router.post("/allergy", createAllergy);

router.post("/diagnoses", createDiagnoses);
router.get("/diagnoses/bill/:visitId", fetchAllDiagnosisBillsByVisitId);

router.post("/requests", createLabRequest);
router.get("/requests/:visitId", fetchLabRequestsByVisitId);
router.get("/requests/bill/:visitId", fetchAllDiagnosisBillsByVisitId);

router.get("/history/:visitId", fetchMedicalHistoryByVisitId);

router.post("/reports/complete-blood-count", createResultsForCompleteBloodCountTest);
router.get("/reports/:diagnosisId", fetchDiagnosisReportByDiagnosisId);

router.get("/tests", fetchTests);


module.exports = router;