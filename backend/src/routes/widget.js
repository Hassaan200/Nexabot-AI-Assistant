import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import pool from '../config/db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/', async (req, res) => {
  try {
    const { key } = req.query;

    // Default settings
    let widgetName = 'AI Assistant';
    let widgetColor = '#2563eb';

    // API key se client ki settings lo
    if (key) {
      const [clients] = await pool.query(
        'SELECT widget_name, widget_color FROM clients WHERE api_key = ? AND is_active = true',
        [key]
      );

      if (clients.length > 0) {
        widgetName = clients[0].widget_name;
        widgetColor = clients[0].widget_color;
      }
    }

    // Widget code pado
    const widgetPath = path.join(__dirname, '../../public/widget.js');
    let widgetCode = readFileSync(widgetPath, 'utf8');

    // Placeholders replace karo client settings se
    widgetCode = widgetCode
      .replace('__WIDGET_NAME__', widgetName)
      .replace('__WIDGET_COLOR__', widgetColor)
      .replace('__SERVER_URL__', process.env.SERVER_URL || 'http://localhost:3000');

    res.setHeader('Content-Type', 'application/javascript');
    res.send(widgetCode);

  } catch (error) {
    console.error('Widget error:', error.message);
    res.status(500).send('// Widget load error');
  }
});

export default router;