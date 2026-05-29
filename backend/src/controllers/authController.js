import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import generateApiKey from '../utils/generateApiKey.js';
import dotenv from 'dotenv';
import crypto from 'crypto'
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
dotenv.config();

// ─── REGISTER ───────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { business_name, email, password, business_type } = req.body;

    // Validation
    if (!business_name || !email || !password) {
      return res.status(400).json({
        error: 'Business name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Email already exists?
    const [existing] = await pool.query(
      'SELECT id FROM clients WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'This email is already registered'
      });
    }

    // Password hash karo
    const password_hash = await bcrypt.hash(password, 12);

    // Unique API key generate karo
    const api_key = generateApiKey();

    // Default system prompt — business type ke hisaab se
    const default_prompt = getDefaultPrompt(business_name, business_type);

    // DB mein save karo
    const [result] = await pool.query(
      `INSERT INTO clients 
       (business_name, email, password_hash, business_type, api_key, system_prompt, widget_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        business_name,
        email,
        password_hash,
        business_type || 'general',
        api_key,
        default_prompt,
        `${business_name} Assistant`
      ]
    );

    // JWT token banao
    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account ban gaya!',
      token,
      client: {
        id: result.insertId,
        business_name,
        email,
        api_key,
        widget_name: `${business_name} Assistant`,
        plan: 'trial',
        system_prompt: '',
      }
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── LOGIN ───────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Client dhundo
    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE email = ?',
      [email]
    );

    if (clients.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const client = clients[0];

    // Account active hai?
    if (!client.is_active) {
      return res.status(403).json({ error: 'This Account is suspended ' });
    }

    // Password check karo
    const isMatch = await bcrypt.compare(password, client.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // JWT token
    const token = jwt.sign(
      { id: client.id, email: client.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      client: {
        id: client.id,
        business_name: client.business_name,
        email: client.email,
        api_key: client.api_key,
        widget_name: client.widget_name,
        widget_color: client.widget_color,
        plan: client.plan,
        trial_ends_at: client.trial_ends_at,
        system_prompt: client.system_prompt,
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── GET PROFILE ─────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const [clients] = await pool.query(
      `SELECT id, business_name, email, api_key, widget_name, 
              widget_color, plan, trial_ends_at, business_type, created_at 
       FROM clients WHERE id = ?`,
      [req.clientId]
    );

    if (clients.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client: clients[0] });

  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── UPDATE SETTINGS ─────────────────────────────────────
export const updateSettings = async (req, res) => {
  try {
    const { system_prompt, widget_name, widget_color } = req.body;

    if (!system_prompt || !widget_name) {
      return res.status(400).json({
        error: 'system_prompt aur widget_name are required'
      });
    }

    await pool.query(
      `UPDATE clients 
       SET system_prompt = ?, widget_name = ?, widget_color = ?
       WHERE id = ?`,
      [system_prompt, widget_name, widget_color, req.clientId]
    );

    // Updated client data wapas bhejo
    const [clients] = await pool.query(
      `SELECT id, business_name, email, api_key, widget_name, 
              widget_color, plan, trial_ends_at, system_prompt, messages_used, messages_limit
       FROM clients WHERE id = ?`,
      [req.clientId]
    );

    res.json({
      message: 'Settings updated!',
      client: clients[0]
    });

  } catch (error) {
    console.error('Settings error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── DEFAULT PROMPTS ─────────────────────────────────────
const getDefaultPrompt = (businessName, type) => {
  const prompts = {
    clinic: `You are a helpful AI assistant for ${businessName}.

SERVICES: Answer questions about clinic services, timings, and doctors.

BOOKING COLLECTION ORDER:
1. Patient name
2. Appointment date  
3. Appointment time (Morning 10AM-1PM / Afternoon 2PM-5PM / Evening 5PM-8PM)
4. Phone number
5. Reason for visit (optional)

IMPORTANT: Collect these one by one. Store in notes: reason for visit.`,

    restaurant: `You are a helpful AI assistant for ${businessName}.

SERVICES: Answer questions about menu, prices, timings, and delivery.

ORDER COLLECTION ORDER:
1. Customer name
2. Order details (what items, quantity)
3. Delivery address
4. Phone number
5. Special instructions (optional)

IMPORTANT: Collect these one by one. Store in notes: full order details + address.`,

    salon: `You are a helpful AI assistant for ${businessName}.

SERVICES: Answer questions about services, prices, and availability.

BOOKING COLLECTION ORDER:
1. Customer name
2. Service required (haircut/color/facial etc)
3. Preferred date
4. Preferred time
5. Phone number

IMPORTANT: Collect these one by one. Store in notes: service type.`,

    general: `You are a helpful AI assistant for ${businessName}.

BOOKING COLLECTION ORDER:
1. Customer name
2. Requirement or query details
3. Preferred date/time (if applicable)
4. Phone number

IMPORTANT: Collect these one by one. Store in notes: requirement details.`,
  };

  return prompts[type] || prompts.general;
};

// Forgot password — reset link bhejo
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required!' });
    }

    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE email = ?',
      [email]
    );

    // Security: email exist kare ya na kare — same response
    if (clients.length === 0) {
  return res.status(404).json({ 
    error: 'This email is not registered. Please check and try again.' 
  });
}

    // Reset token banao
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      `UPDATE clients 
       SET reset_token = ?, reset_token_expiry = ?
       WHERE email = ?`,
      [resetToken, resetExpiry, email]
    );

    // Reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: 'Veloxa <onboarding@resend.dev>',
      to: email,
      subject: 'Veloxa — Password Reset Request',
      html: `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: #2563eb; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🤖 Veloxa</h1>
      </div>
      <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #64748b;">
          Aapne password reset request ki hai. Neeche button pe click karein:
        </p>
        <a href="${resetLink}" 
           style="display: inline-block; background: #2563eb; color: white; 
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          Yeh link 1 ghante mein expire ho jaayega.<br/>
          Agar aapne request nahi ki toh ignore karein.
        </p>
      </div>
    </div>
  `
    });

    res.json({
      message: 'Password reset link sent!.',
      // Dev ke liye — production mein hata dena
      // dev_link: resetLink
    });
 
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password required!' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password required atleast 6 characters' });
    }

    // Token valid hai?
    const [clients] = await pool.query(
      `SELECT * FROM clients 
       WHERE reset_token = ? 
       AND reset_token_expiry > NOW()`,
      [token]
    );

    if (clients.length === 0) {
      return res.status(400).json({
        error: 'Reset link invalid or expired. Try again.'
      });
    }

    // Password update karo
    const password_hash = await bcrypt.hash(password, 12);

    await pool.query(
      `UPDATE clients 
       SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = ?`,
      [password_hash, clients[0].id]
    );

    res.json({ message: 'Password reset Successfully Now you can login' });

  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};