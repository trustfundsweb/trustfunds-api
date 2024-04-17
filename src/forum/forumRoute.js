const express = require("express");
const router = express.Router();
const { getAllMessages, sendMessage } = require("./forumController");
const verifyToken = require("../middleware/verifyToken");

router.route("/:id").get(getAllMessages);
router.route("/:id/send").post(verifyToken, sendMessage);

module.exports = router;
