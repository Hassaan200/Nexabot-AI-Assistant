import express from 'express';

const router = express.Router();
import { chat, getHistory } from '../controllers/chatController.js';

router.post('/', chat);
router.get('/history', getHistory);

export default router