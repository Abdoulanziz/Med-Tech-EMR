const express = require("express");
const router = express.Router();


const { requireLogin } = require("../middlewares/auth");
const { renderPatients, renderVisits, renderQueues, renderLab, renderPharmacy } = require("../controllers/pageController");

const { registerSSE } = require("../controllers/sseController");

router.get("/sse", registerSSE);

router.get("/patients", requireLogin, renderPatients);
router.get("/visits", requireLogin, renderVisits);
router.get("/queues", requireLogin, renderQueues);
router.get("/lab", requireLogin, renderLab);
router.get("/pharmacy", requireLogin, renderPharmacy);

module.exports = router;