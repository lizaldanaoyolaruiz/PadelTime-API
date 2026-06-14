const { Router } = require('express');
const { chatbot } = require('../controllers/chatbotController');

const router = Router();

router.post('/', chatbot);

module.exports = router;
