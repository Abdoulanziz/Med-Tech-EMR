const express = require("express");
const router = express.Router();

const { requireLogin, checkUserRoleId } = require("../middlewares/auth");
const { renderDashboard, renderAccounts } = require("../controllers/adminController");

// TODO: moveRoleId to .env
router.get("/dashboard", requireLogin, checkUserRoleId(1), renderDashboard);
router.get("/accounts", requireLogin, checkUserRoleId(1), renderAccounts);

module.exports = router;
