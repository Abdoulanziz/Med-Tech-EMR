const express = require("express");
const router = express.Router();


const { requireLogin } = require("../middlewares/auth");
const { renderPatients, renderVisits, renderQueues, renderDental, renderPharmacy } = require("../controllers/pageController");

const { registerSSE } = require("../controllers/sseController");

// Route for SSE connections
// router.get('/sse', (req, res) => {
//   sse.addSSEConnection(res);
// });

router.get("/sse", registerSSE);

router.get("/patients", requireLogin, renderPatients);
router.get("/visits", requireLogin, renderVisits);
router.get("/queues", requireLogin, renderQueues);
router.get("/dental", requireLogin, renderDental);
router.get("/pharmacy", requireLogin, renderPharmacy);

module.exports = router;