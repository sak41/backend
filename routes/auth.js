const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");

const bcrypt = require("bcryptjs");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);

module.exports = router;

