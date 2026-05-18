import express from 'express';
import { register, login, getProfile, updateSettings } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/settings', authMiddleware, updateSettings);

export default router;