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
    createClinicalRequestForDental,
    updateClinicalRequestForDentalById,
    createClinicalRequestForCardiology,
    updateClinicalRequestForCardiologyById,
    createClinicalRequestForRadiology,
    updateClinicalRequestForRadiologyById,
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
router.put("/patients/:id", updatePatient);
router.get("/patients/visit/:visitId", fetchPatientByVisitId);

router.post("/visits", createVisit);
router.get("/visits", fetchVisits);
router.get("/visit/:id", fetchVisitById);
router.put("/visits/:id", updateVisitById);
router.get("/visits/:id", fetchVisitsByPatientId);


router.post("/queues", addPatientToQueue);
router.get("/queues", fetchAllPatientsOnQueue);

router.post("/triages", createTriage);
router.put("/triages/:id", updateTriageById);

router.post("/allergies", createAllergy);
router.put("/allergies/:id", updateAllergyById);

router.post("/services/eye/requests", createClinicalRequestForEye);
router.put("/services/eye/requests/:id", updateClinicalRequestForEyeById);

router.post("/services/dental/requests", createClinicalRequestForDental);
router.put("/services/dental/requests/:id", updateClinicalRequestForDentalById);
;
router.post("/services/cardiology/requests", createClinicalRequestForCardiology);
router.put("/services/cardiology/requests/:id", updateClinicalRequestForCardiologyById);

router.post("/services/radiology/requests", createClinicalRequestForRadiology);
router.put("/services/radiology/requests/:id", updateClinicalRequestForRadiologyById);

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