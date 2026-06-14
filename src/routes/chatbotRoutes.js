import { Router } from 'express';
import { chatbot } from '../controllers/chatbotController.js';

const router = Router();

// Público — no requiere login
router.post('/', chatbot);

export default router;
