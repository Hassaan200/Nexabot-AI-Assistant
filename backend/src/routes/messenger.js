import express from 'express';
import { verifyWebhook, handleMessage } from '../controllers/messengerController.js';

const router = express.Router();

router.get('/webhook', verifyWebhook);
router.post('/webhook', handleMessage);

export default router;