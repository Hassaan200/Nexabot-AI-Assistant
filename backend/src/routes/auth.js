import express from 'express';
import { register, login, getProfile, updateSettings, forgotPassword, resetPassword  } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/settings', authMiddleware, updateSettings);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;