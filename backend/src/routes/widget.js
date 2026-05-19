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

    const widgetCode = `
(function () {
  const script = document.currentScript;
  const API_KEY = script.getAttribute('data-api-key');
  const SERVER_URL = '${serverUrl}';
  const WIDGET_NAME = '${widgetName}';
  const WIDGET_COLOR = '${widgetColor}';
  const SESSION_ID = 'session_' + Math.random().toString(36).substr(2, 9);

  const style = document.createElement('style');
  style.innerHTML = \`
    #nexabot-bubble {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: \${WIDGET_COLOR}; color: white; font-size: 26px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 99999; border: none; transition: transform 0.2s ease;
    }
    #nexabot-bubble:hover { transform: scale(1.1); }
    #nexabot-window {
      position: fixed; bottom: 90px; right: 24px;
      width: 340px; height: 480px; border-radius: 16px;
      background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: none; flex-direction: column; z-index: 99998;
      font-family: sans-serif; overflow: hidden;
    }
    #nexabot-header {
      background: \${WIDGET_COLOR}; color: white;
      padding: 16px; font-weight: bold; font-size: 15px;
    }
    #nexabot-messages {
      flex: 1; overflow-y: auto; padding: 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .nexabot-msg {
      max-width: 80%; padding: 10px 14px;
      border-radius: 12px; font-size: 13px; line-height: 1.5;
    }
    .nexabot-msg.bot {
      background: #f1f5f9; color: #1e293b;
      align-self: flex-start; border-bottom-left-radius: 2px;
    }
    .nexabot-msg.user {
      background: \${WIDGET_COLOR}; color: white;
      align-self: flex-end; border-bottom-right-radius: 2px;
    }
    #nexabot-input-area {
      display: flex; padding: 10px;
      border-top: 1px solid #e2e8f0; gap: 8px;
    }
    #nexabot-input {
      flex: 1; padding: 8px 12px; border-radius: 20px;
      border: 1px solid #cbd5e1; outline: none; font-size: 13px;
    }
    #nexabot-input:focus { border-color: \${WIDGET_COLOR}; }
    #nexabot-send {
      background: \${WIDGET_COLOR}; color: white; border: none;
      border-radius: 50%; width: 36px; height: 36px;
      cursor: pointer; font-size: 16px;
    }
    .nexabot-typing {
      background: #f1f5f9; color: #94a3b8;
      align-self: flex-start; padding: 10px 14px;
      border-radius: 12px; font-size: 13px;
    }
  \`;
  document.head.appendChild(style);

  document.body.innerHTML += \`
    <div id="nexabot-bubble">💬</div>
    <div id="nexabot-window">
      <div id="nexabot-header">🤖 \${WIDGET_NAME}</div>
      <div id="nexabot-messages"></div>
      <div id="nexabot-input-area">
        <input id="nexabot-input" type="text" placeholder="Message likhein..." />
        <button id="nexabot-send">➤</button>
      </div>
    </div>
  \`;

  const bubble = document.getElementById('nexabot-bubble');
  const chatWindow = document.getElementById('nexabot-window');
  const messages = document.getElementById('nexabot-messages');
  const input = document.getElementById('nexabot-input');
  const sendBtn = document.getElementById('nexabot-send');

  bubble.addEventListener('click', () => {
    const isOpen = chatWindow.style.display === 'flex';
    chatWindow.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen && messages.children.length === 0) {
      addMessage('bot', 'Assalam o Alaikum! Main aapki kaise madad kar sakta hun?');
    }
  });

  const addMessage = (role, text) => {
    const div = document.createElement('div');
    div.className = 'nexabot-msg ' + role;
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const showTyping = () => {
    const div = document.createElement('div');
    div.className = 'nexabot-typing';
    div.id = 'nexabot-typing';
    div.innerText = '...';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const hideTyping = () => {
    const t = document.getElementById('nexabot-typing');
    if (t) t.remove();
  };

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage('user', text);
    input.value = '';
    showTyping();
    try {
      const res = await fetch(SERVER_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: SESSION_ID,
          api_key: API_KEY,
        }),
      });
      const data = await res.json();
      hideTyping();
      addMessage('bot', data.reply || 'Kuch masla hua, dobara try karein.');
    } catch (err) {
      hideTyping();
      addMessage('bot', 'Connection error, dobara try karein.');
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
    `;

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(widgetCode);

  } catch (error) {
    console.error('Widget error:', error.message);
    res.status(500).send('// Widget load error: ' + error.message);
  }
});

export default router;