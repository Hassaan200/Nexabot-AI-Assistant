import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './src/config/db.js';
import router from './src/routes/chat.js';
import widgetRoutes from './src/routes/widget.js'
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/auth.js'
import dashboardRoutes from './src/routes/dashboard.js';
import adminRoutes from './src/routes/admin.js';
import webhookRoutes from './src/routes/webhook.js';
import { handleWebhook } from './src/controllers/webhookController.js';
 


dotenv.config();
const app = express();
app.use(cors({
  origin: [
    'http://localhost:5005',
    'http://192.168.43.37:5005',
    'https://nexabot-ai-assistant-seven.vercel.app',
    '*'
  ],
  credentials: true,
}));

// IMPORTANT: webhook route express.json() se PEHLE Hai ISS LYE YEHA DAL RHA HUN
app.post('/api/webhook/lemonsqueezy',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.body = JSON.parse(req.body);
    next();
  },
  handleWebhook
);

app.use(express.json());
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.json({ message: 'Veloxa server is ruuning!' })
});

// chat route active yeha horha hai
app.use('/api/chat', router);
app.use('/widget.js', widgetRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);


app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Veloxa server is running on ${PORT}`)
});
