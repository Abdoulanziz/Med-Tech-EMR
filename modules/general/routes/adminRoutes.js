const express = require("express");
const router = express.Router();

const { requireLogin, checkUserRoleId } = require("../middlewares/auth");
const { renderDashboard, renderAccounts, renderActivities, renderInventory, renderReports, renderSettings } = require("../controllers/adminController");

// TODO: moveRoleId to .env
router.get("/dashboard", requireLogin, checkUserRoleId(2), renderDashboard);
router.get("/accounts", requireLogin, checkUserRoleId(2), renderAccounts);
router.get("/activities", requireLogin, checkUserRoleId(2), renderActivities);
router.get("/inventory", requireLogin, checkUserRoleId(2), renderInventory);
router.get("/reports", requireLogin, checkUserRoleId(2), renderReports);
router.get("/settings", requireLogin, checkUserRoleId(2), renderSettings);

module.exports = router;
