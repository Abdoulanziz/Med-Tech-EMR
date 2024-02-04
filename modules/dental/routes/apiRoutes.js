const express = require("express");
const router = express.Router();

const { 
    checkAPIStatus,
    createFacility,
    fetchFacilityById,
    updateFacilityById,
    updateFacilitySettingByFacilityIdAndFacilitySettingId,
    fetchFacilitySettingByFacilityIdAndFacilitySettingId,
    createUser,
    updateUser,
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
    createClinicalProcedureForDental,
    fetchClinicalProceduresForDental,
    updateClinicalProcedureForDental,
    fetchClinicalProcedureNamesForDental,
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
    fetchClinicalRequestForDentalByVisitId,
    updateLabRequestPaymentStatus,
    fetchMedicalHistoryByVisitId, 
    fetchMedicalHistoryForDentalByVisitId,
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
    fetchPatientsCountByCountTypeAndDateRange,
    fetchIncomeByDateRange,
    fetchExpensesByDateRange,
    fetchIncomeByFilterTypeAndByDateRange,
    fetchExpensesByFilterTypeAndByDateRange,
} = require("../controllers/apiController");

router.get("/status", checkAPIStatus);

router.post("/facilities", createFacility);
router.get("/facilities/:id", fetchFacilityById);
router.put("/facilities/:id", updateFacilityById);
router.put("/facilities/:id/settings/:settingsId", updateFacilitySettingByFacilityIdAndFacilitySettingId);
router.get("/facilities/:id/settings/:settingsId", fetchFacilitySettingByFacilityIdAndFacilitySettingId);

router.post("/users", createUser);
router.get("/users", fetchUsers);
router.put("/users/:id", updateUser);

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
router.patch("/services/eye/requests/:id/payment-status/:status", updateClinicalRequestForEyePaymentStatusById);

router.post("/services/dental/procedures", createClinicalProcedureForDental);
router.get("/services/dental/procedures", fetchClinicalProceduresForDental);
router.put("/services/dental/procedures/:id", updateClinicalProcedureForDental);
router.get("/services/dental/procedures/names", fetchClinicalProcedureNamesForDental);

router.post("/services/dental/requests", createClinicalRequestForDental);
router.get("/services/dental/requests/:visitId", fetchClinicalRequestForDentalByVisitId);
router.put("/services/dental/requests/:id", updateClinicalRequestForDentalById);
router.patch("/services/dental/requests/:id/payment-status/:status", updateClinicalRequestForDentalPaymentStatusById);

router.post("/services/cardiology/requests", createClinicalRequestForCardiology);
router.put("/services/cardiology/requests/:id", updateClinicalRequestForCardiologyById);
router.patch("/services/cardiology/requests/:id/payment-status/:status", updateClinicalRequestForCardiologyPaymentStatusById);

router.post("/services/radiology/requests", createClinicalRequestForRadiology);
router.put("/services/radiology/requests/:id", updateClinicalRequestForRadiologyById);
router.patch("/services/radiology/requests/:id/payment-status/:status", updateClinicalRequestForRadiologyPaymentStatusById);


router.post("/requests", createLabRequest);
router.put("/requests/:id", updateLabRequestById);
router.get("/requests/:visitId", fetchLabRequestsByVisitId);
router.patch("/requests/:requestId/payment-status/:status", updateLabRequestPaymentStatus);

router.get("/bills/:visitId", fetchBillsByVisitId);
router.get("/bills/:visitId/unpaid", fetchUnpaidBillsByVisitId);

router.get("/history/:visitId", fetchMedicalHistoryByVisitId);
router.get("/history-dental/:visitId", fetchMedicalHistoryForDentalByVisitId);

router.post("/results/complete-blood-count", createResultsForCompleteBloodCountTest);
router.get("/results/complete-blood-count/:requestId", fetchResultsForCompleteBloodCountTestByRequestId);

router.post("/results/urinalysis", createResultsForUrinalysisTest);
router.get("/results/urinalysis/:requestId", fetchResultsForUrinalysisTestByRequestId);

router.post("/prescriptions", createPrescription);
router.get("/prescriptions/:visitId", fetchPrescriptionsByVisitId);


router.get("/tests", fetchTests);
router.get("/medicines", fetchMedicines);


router.get("/admin/audit-logs", fetchAuditLogs);

router.get("/finance/income", fetchIncome);
router.post("/finance/expenses", createExpenseRecord);
router.get("/finance/expenses", fetchExpenses);


router.get("/analytics/patients/:countType/:startDate/:endDate", fetchPatientsCountByCountTypeAndDateRange);
router.get("/analytics/income/:startDate/:endDate", fetchIncomeByDateRange);
router.get("/analytics/expenses/:startDate/:endDate", fetchExpensesByDateRange);

router.get("/analytics/income/:filterType/:startDate/:endDate", fetchIncomeByFilterTypeAndByDateRange);
router.get("/analytics/expenses/:filterType/:startDate/:endDate", fetchExpensesByFilterTypeAndByDateRange);

module.exports = router;