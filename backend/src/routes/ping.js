import express from 'express';
const router = express.Router();

// UptimeRobot ke liye bina kisi auth ke simple GET endpoint
router.get('/ping', (req, res) => {
  return res.status(200).json({ 
    status: 'alive', 
    timestamp: new Date().toISOString() 
  });
});

export default router;