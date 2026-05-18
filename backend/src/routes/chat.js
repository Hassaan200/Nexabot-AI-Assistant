import express from 'express';

const router = express.Router();
import chat from '../controllers/chatController.js';

router.post('/', chat);

export default router