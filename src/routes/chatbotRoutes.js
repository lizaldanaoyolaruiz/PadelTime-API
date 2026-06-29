import { Router } from 'express';
import { chatbot } from '../controllers/chatbotController.js';

const router = Router();

router.post('/', chatbot);

export default router;
