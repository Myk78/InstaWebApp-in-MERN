const express = require("express");
const { isAuthenticate } = require("../middlewares/isAuthenticated");
const { getMessage, sendMessage } = require("../controllers/messageController");
const router = express();

router.get("/message/:id/get", isAuthenticate, getMessage);
router.post("/message/:id/send", isAuthenticate, sendMessage);

module.exports = router;
