const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middlewares/auth");

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
    fetchDoctors,
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
    fetchPatientsCountByCountTypeAndDateRange,
    fetchIncomeByDateRange,
    fetchExpensesByDateRange,
    fetchIncomeByFilterTypeAndByDateRange,
    fetchExpensesByFilterTypeAndByDateRange,
} = require("../controllers/apiController");

router.get("/status", requireLogin, checkAPIStatus);

router.post("/facilities", requireLogin, createFacility);
router.get("/facilities/:id", requireLogin, fetchFacilityById);
router.put("/facilities/:id", requireLogin, updateFacilityById);
router.put("/facilities/:id/settings/:settingsId", requireLogin, updateFacilitySettingByFacilityIdAndFacilitySettingId);
router.get("/facilities/:id/settings/:settingsId", requireLogin, fetchFacilitySettingByFacilityIdAndFacilitySettingId);

router.post("/users", requireLogin, createUser);
router.get("/users", requireLogin, fetchUsers);
router.put("/users/:id", requireLogin, updateUser);

router.post("/doctors", requireLogin, createDoctor);
router.get("/doctors/:id", requireLogin, fetchDoctorByUserId);
router.put("/doctors/:id", requireLogin, updateDoctor);
router.get("/doctors", requireLogin, fetchDoctors);

router.post("/patients", requireLogin, createPatient);
router.get("/patients", requireLogin, fetchPatients);
router.get("/patients/:id", requireLogin, fetchPatientById);
router.put("/patients/:id", requireLogin, updatePatient);
router.get("/patients/visit/:visitId", requireLogin, fetchPatientByVisitId);

router.post("/visits", requireLogin, createVisit);
router.get("/visits", requireLogin, fetchVisits);
router.get("/visit/:id", requireLogin, fetchVisitById);
router.put("/visits/:id", requireLogin, updateVisitById);
router.get("/visits/:id", requireLogin, fetchVisitsByPatientId);


router.post("/queues", requireLogin, addPatientToQueue);
router.get("/queues", requireLogin, fetchAllPatientsOnQueue);

router.post("/triages", requireLogin, createTriage);
router.put("/triages/:id", requireLogin, updateTriageById);

router.post("/allergies", requireLogin, createAllergy);
router.put("/allergies/:id", requireLogin, updateAllergyById);

router.post("/services/eye/requests", requireLogin, createClinicalRequestForEye);
router.put("/services/eye/requests/:id", requireLogin, updateClinicalRequestForEyeById);
router.patch("/services/eye/requests/:id/payment-status/:status", requireLogin, updateClinicalRequestForEyePaymentStatusById);

router.post("/services/dental/procedures", requireLogin, createClinicalProcedureForDental);
router.get("/services/dental/procedures", requireLogin, fetchClinicalProceduresForDental);
router.put("/services/dental/procedures/:id", requireLogin, updateClinicalProcedureForDental);
router.get("/services/dental/procedures/names", requireLogin, fetchClinicalProcedureNamesForDental);

router.post("/services/dental/requests", requireLogin, createClinicalRequestForDental);
router.put("/services/dental/requests/:id", requireLogin, updateClinicalRequestForDentalById);
router.patch("/services/dental/requests/:id/payment-status/:status", requireLogin, updateClinicalRequestForDentalPaymentStatusById);

router.post("/services/cardiology/requests", requireLogin, createClinicalRequestForCardiology);
router.put("/services/cardiology/requests/:id", requireLogin, updateClinicalRequestForCardiologyById);
router.patch("/services/cardiology/requests/:id/payment-status/:status", requireLogin, updateClinicalRequestForCardiologyPaymentStatusById);

router.post("/services/radiology/requests", requireLogin, createClinicalRequestForRadiology);
router.put("/services/radiology/requests/:id", requireLogin, updateClinicalRequestForRadiologyById);
router.patch("/services/radiology/requests/:id/payment-status/:status", requireLogin, updateClinicalRequestForRadiologyPaymentStatusById);


router.post("/requests", requireLogin, createLabRequest);
router.put("/requests/:id", requireLogin, updateLabRequestById);
router.get("/requests/:visitId", requireLogin, fetchLabRequestsByVisitId);
router.patch("/requests/:requestId/payment-status/:status", requireLogin, updateLabRequestPaymentStatus);

router.get("/bills/:visitId", requireLogin, fetchBillsByVisitId);
router.get("/bills/:visitId/unpaid", requireLogin, fetchUnpaidBillsByVisitId);

router.get("/history/:visitId", requireLogin, fetchMedicalHistoryByVisitId);

router.post("/results/complete-blood-count", requireLogin, createResultsForCompleteBloodCountTest);
router.get("/results/complete-blood-count/:requestId", requireLogin, fetchResultsForCompleteBloodCountTestByRequestId);

router.post("/results/urinalysis", requireLogin, createResultsForUrinalysisTest);
router.get("/results/urinalysis/:requestId", requireLogin, fetchResultsForUrinalysisTestByRequestId);

router.post("/prescriptions", requireLogin, createPrescription);
router.get("/prescriptions/:visitId", requireLogin, fetchPrescriptionsByVisitId);


router.get("/tests", requireLogin, fetchTests);
router.get("/medicines", requireLogin, fetchMedicines);


router.get("/admin/audit-logs", requireLogin, fetchAuditLogs);

router.get("/finance/income", requireLogin, fetchIncome);
router.post("/finance/expenses", requireLogin, createExpenseRecord);
router.get("/finance/expenses", requireLogin, fetchExpenses);


router.get("/analytics/patients/:countType/:startDate/:endDate", requireLogin, fetchPatientsCountByCountTypeAndDateRange);
router.get("/analytics/income/:startDate/:endDate", requireLogin, fetchIncomeByDateRange);
router.get("/analytics/expenses/:startDate/:endDate", requireLogin, fetchExpensesByDateRange);

router.get("/analytics/income/:filterType/:startDate/:endDate", requireLogin, fetchIncomeByFilterTypeAndByDateRange);
router.get("/analytics/expenses/:filterType/:startDate/:endDate", requireLogin, fetchExpensesByFilterTypeAndByDateRange);

module.exports = router;