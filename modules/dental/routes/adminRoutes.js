const express = require("express");
const router = express.Router();

const { requireLogin, checkUserRoleId } = require("../middlewares/auth");
const { renderDashboard, renderServices, renderAccounts, renderActivities, renderSettings } = require("../controllers/adminController");

// TODO: moveRoleId to .env
router.get("/dashboard", requireLogin, checkUserRoleId(2), renderDashboard);
router.get("/services", requireLogin, checkUserRoleId(2), renderServices);
router.get("/accounts", requireLogin, checkUserRoleId(2), renderAccounts);
router.get("/activities", requireLogin, checkUserRoleId(2), renderActivities);
router.get("/settings", requireLogin, checkUserRoleId(2), renderSettings);

module.exports = router;
