import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/', (req, res) => {
  const widgetPath = path.join(__dirname, '../../public/widget.js');
  const widgetCode = readFileSync(widgetPath, 'utf8');
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(widgetCode);
});

export default router;