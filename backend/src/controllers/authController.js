import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import generateApiKey from '../utils/generateApiKey.js';
import dotenv from 'dotenv';
dotenv.config();

// ─── REGISTER ───────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { business_name, email, password, business_type } = req.body;

    // Validation
    if (!business_name || !email || !password) {
      return res.status(400).json({ 
        error: 'business_name, email aur password zaroori hain' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password kam se kam 6 characters ka hona chahiye' 
      });
    }

    // Email already exists?
    const [existing] = await pool.query(
      'SELECT id FROM clients WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Yeh email already registered hai' 
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
        error: 'Email aur password zaroori hain' 
      });
    }

    // Client dhundo
    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE email = ?',
      [email]
    );

    if (clients.length === 0) {
      return res.status(401).json({ error: 'Email ya password galat hai' });
    }

    const client = clients[0];

    // Account active hai?
    if (!client.is_active) {
      return res.status(403).json({ error: 'Account suspend hai' });
    }

    // Password check karo
    const isMatch = await bcrypt.compare(password, client.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ya password galat hai' });
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
      return res.status(404).json({ error: 'Client nahi mila' });
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

    await pool.query(
      `UPDATE clients 
       SET system_prompt = ?, widget_name = ?, widget_color = ?
       WHERE id = ?`,
      [system_prompt, widget_name, widget_color, req.clientId]
    );

    res.json({ message: 'Settings update ho gayi!' });

  } catch (error) {
    console.error('Settings error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── DEFAULT PROMPTS ─────────────────────────────────────
const getDefaultPrompt = (businessName, type) => {
  const prompts = {
    clinic: `You are a helpful assistant for ${businessName}. Help patients with appointment booking, service information, and general queries. Always be polite and professional.`,
    restaurant: `You are a helpful assistant for ${businessName}. Help customers with menu information, table reservations, delivery queries, and timings. Always be friendly.`,
    salon: `You are a helpful assistant for ${businessName}. Help clients with appointment booking, service prices, and general queries. Always be welcoming.`,
    general: `You are a helpful assistant for ${businessName}. Answer customer queries professionally and help with appointments if needed.`,
  };
  return prompts[type] || prompts.general;
};