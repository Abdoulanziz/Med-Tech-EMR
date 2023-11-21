const express = require("express");
const router = express.Router();

const { requireLogin, checkUserRoleId } = require("../middlewares/auth");
const { renderDashboard } = require("../controllers/adminController");

router.get("/dashboard", requireLogin, checkUserRoleId(1), renderDashboard);

module.exports = router;
