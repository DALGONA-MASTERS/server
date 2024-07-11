// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/MessageController');
const { checkUser } = require("../middleware/AuthMiddleware");
const upload = require('../utils/uploadAudio');

router.post('/send', checkUser, upload.single('audio'), sendMessage);
router.get('/:otherUserId', checkUser, getMessages);

module.exports = router;