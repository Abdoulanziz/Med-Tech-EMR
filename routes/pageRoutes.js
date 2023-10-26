const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middlewears/auth");
const { renderPatients, renderVisits, renderQueues } = require("../controllers/pageController");

router.get("/patients", requireLogin, renderPatients);
router.get("/visits", requireLogin, renderVisits);
router.get("/queues", requireLogin, renderQueues);

module.exports = router;
