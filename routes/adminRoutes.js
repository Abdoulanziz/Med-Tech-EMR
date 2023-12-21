const express = require("express");
const router = express.Router();

const { requireLogin, checkUserRoleId } = require("../middlewares/auth");
const { renderDashboard, renderAccounts, renderActivities, renderInventory, renderReports } = require("../controllers/adminController");

// TODO: moveRoleId to .env
router.get("/dashboard", requireLogin, checkUserRoleId(1), renderDashboard);
router.get("/accounts", requireLogin, checkUserRoleId(1), renderAccounts);
router.get("/activities", requireLogin, checkUserRoleId(1), renderActivities);
router.get("/inventory", requireLogin, checkUserRoleId(1), renderInventory);
router.get("/reports", requireLogin, checkUserRoleId(1), renderReports);

module.exports = router;
