const express = require("express");
const router = express.Router();
const { register, login, logout } = require("./userController");
const verifyToken = require("../middleware/verifyToken");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(verifyToken, logout);

module.exports = router;
