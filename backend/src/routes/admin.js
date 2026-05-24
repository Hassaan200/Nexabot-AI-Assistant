import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Secret admin key middleware
const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Client ka plan upgrade karo
router.post('/upgrade', adminAuth, async (req, res) => {
  try {
    const { email, plan } = req.body;

    const plans = {
      trial:    { limit: 100,   model: 'gemini-2.5-flash', days: 7 },
      starter:  { limit: 2000,  model: 'gemini-2.5-flash', days: 30 },
      business: { limit: 10000, model: 'gemini-2.5-pro',   days: 30 },
    };

    if (!plans[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plans[plan].days);

    await pool.query(
      `UPDATE clients 
       SET plan = ?, 
           messages_limit = ?,
           messages_used = 0,
           is_active = 1,
           plan_expires_at = ?
       WHERE email = ?`,
      [plan, plans[plan].limit, expiryDate, email]
    );

    res.json({
      message: `${email} upgraded to ${plan}!`,
      messages_limit: plans[plan].limit,
      ai_model: plans[plan].model,
      expires_at: expiryDate,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sare clients dekho
router.get('/clients', adminAuth, async (req, res) => {
  try {
    const [clients] = await pool.query(
      `SELECT id, business_name, email, plan, 
              messages_used, messages_limit, is_active, created_at 
       FROM clients ORDER BY created_at DESC`
    );
    res.json({ clients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;