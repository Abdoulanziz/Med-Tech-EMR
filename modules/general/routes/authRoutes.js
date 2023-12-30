const express = require("express");
const router = express.Router();

const {renderIndex, renderSignin, handleSignin, handleSignout} = require("../controllers/authController");

router.get("/", renderIndex);
router.get("/signin", renderSignin);
router.post("/signin", handleSignin);
router.post("/signout", handleSignout);

module.exports = router;
