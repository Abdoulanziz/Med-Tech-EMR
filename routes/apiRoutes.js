const express = require("express");
const router = express.Router();

const { 
    checkAPIStatus,
    createUser,
    createDoctor, 
    fetchDoctorByUserId,
    updateDoctor,
    fetchUsers,
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
    createPrescription,
    fetchPrescriptionsByVisitId,
} = require("../controllers/apiController");

router.get("/status", checkAPIStatus);

router.post("/users", createUser);
router.get("/users", fetchUsers);

router.post("/doctors", createDoctor);
router.get("/doctors/:id", fetchDoctorByUserId);
router.put("/doctors/:id", updateDoctor);

router.post("/patients", createPatient);
router.get("/patients", fetchPatients);
router.get("/patients/:id", fetchPatientById);
router.get("/patients/visit/:visitId", fetchPatientByVisitId);

router.post("/visits", createVisit);
router.get("/visits", fetchVisits);
router.get("/visits/:id", fetchVisitsByPatientId);


router.post("/queues", addPatientToQueue);
router.get("/queues", fetchAllPatientsOnQueue);

router.post("/triage", createTriage);
router.post("/allergy", createAllergy);

router.post("/requests", createLabRequest);
router.get("/requests/:visitId", fetchLabRequestsByVisitId);
router.patch("/requests/:requestId/payment-status/:status", updateLabRequestPaymentStatus);

router.get("/bills/:visitId", fetchBillsByVisitId);
router.get("/bills/:visitId/unpaid", fetchUnpaidBillsByVisitId);

router.get("/history/:visitId", fetchMedicalHistoryByVisitId);

router.post("/results/complete-blood-count", createResultsForCompleteBloodCountTest);
router.get("/results/complete-blood-count/:requestId", fetchResultsForCompleteBloodCountTestByRequestId);

router.post("/results/urinalysis", createResultsForUrinalysisTest);
router.get("/results/urinalysis/:requestId", fetchResultsForUrinalysisTestByRequestId);

router.post("/prescriptions", createPrescription);
router.get("/prescriptions/:visitId", fetchPrescriptionsByVisitId);


router.get("/tests", fetchTests);
router.get("/medicines", fetchMedicines);


module.exports = router;