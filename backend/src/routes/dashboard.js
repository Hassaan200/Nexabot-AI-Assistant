import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getStats,
  getBookings,
  updateBookingStatus,
  getConversations,
  getConversationMessages,
} from '../controllers/dashboardController.js';

const router = express.Router();

// Sab routes protected hain — login zaroori
router.use(authMiddleware);

router.get('/stats', getStats);
router.get('/bookings', getBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getConversationMessages);

export default router;