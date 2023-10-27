const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middlewears/auth");
const { renderPatients, renderVisits, renderQueues, renderLab } = require("../controllers/pageController");

router.get("/patients", requireLogin, renderPatients);
router.get("/visits", requireLogin, renderVisits);
router.get("/queues", requireLogin, renderQueues);
router.get("/lab", requireLogin, renderLab);

module.exports = router;
