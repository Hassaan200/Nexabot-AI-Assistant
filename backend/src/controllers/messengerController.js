import pool from '../config/db.js';
import { getAIReply } from '../services/aiService.js';
import {
  getSessionState,
  setSessionState,
  clearSession,
  saveBooking,
  updateBooking,
  cancelBooking,
  getLastBooking,
  isBookingComplete,
} from '../services/bookingService.js';

// Facebook pe message bhejo
const sendMessage = async (recipientId, text) => {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.FACEBOOK_PAGE_TOKEN}`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });
};

// Webhook verify — Meta ka requirement
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // 1. UptimeRobot ka bypass (HEAD aur bina token wali GET requests ke liye)
  if (req.method === 'HEAD' || !mode) {
    console.log('UptimeRobot ping received, keeping server alive!');
    return res.status(200).send('SERVER_IS_ALIVE');
  }

  // 2. Meta Messenger Verification Logic
  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    console.log('Webhook verified by Meta!');
    return res.status(200).send(challenge);
  } else {
    console.log('Verification failed: Token mismatch');
    return res.status(403).send('Forbidden');
  }
};

// Message receive karo
// Message receive karo
export const handleMessage = async (req, res) => {
  try {
    const body = req.body;

    if (body.object !== 'page') {
      return res.status(404).send('Not Found');
    }

    const messagesToProcess = [];

    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        if (!event.message || event.message.is_echo) continue;
        if (!event.message.text) continue;
        messagesToProcess.push({
          senderId: event.sender.id,
          message: event.message.text,
        });
      }
    }

    // 1. Meta ko sab se pehle response bhej kar free karo
    res.status(200).send('EVENT_RECEIVED');

    // 2. 🔥 THE MAGIC TRICK: Apne server ko khud background me hit karo (Dashboard ki tarah)
    // Isse Vercel ko jhatka lagega aur wo background process ko 100% active rakhega
    fetch('https://nexabot-ai-assistant.vercel.app/api/dashboard/conversations', {
      headers: { 'User-Agent': 'Vercel-Self-KeepAlive' }
    }).catch(() => {}); // Error aaye toh ignore karein, maqsad sirf hit marna hai

    // 3. Ab sukoon se background me process chalao
    Promise.all(
      messagesToProcess.map(({ senderId, message }) => 
        processMessage(senderId, message).catch(err => 
          console.error('Background process error:', err.message)
        )
      )
    );

  } catch (error) {
    console.error('Messenger error:', error.message);
    if (!res.headersSent) {
      res.status(200).send('EVENT_RECEIVED');
    }
  }
};

const processMessage = async (senderId, message) => {
  try {
    // Default client dhundo — messenger ke liye
    // Page ID se client match karo
    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE facebook_page_id = ? AND is_active = 1',
      [process.env.FACEBOOK_PAGE_ID]
    );

    if (clients.length === 0) {
      await sendMessage(senderId, "Service unavailable. Please try again later.");
      return;
    }

    const client = clients[0];

    // Message limit check
    if (client.messages_used >= client.messages_limit) {
      await sendMessage(senderId, "Service temporarily unavailable.");
      return;
    }

    // Session ID — sender ID use karo
    const session_id = `fb_${senderId}`;

    // Conversation lo ya banao
    const [conversations] = await pool.query(
      'SELECT * FROM conversations WHERE session_id = ? AND client_id = ?',
      [session_id, client.id]
    );

    let conversation_id;
    if (conversations.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO conversations (client_id, session_id) VALUES (?, ?)',
        [client.id, session_id]
      );
      conversation_id = result.insertId;
    } else {
      conversation_id = conversations[0].id;
    }

    // History lo
    const [history] = await pool.query(
      `SELECT role, content FROM messages 
       WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 20`,
      [conversation_id]
    );

    // Session state
    let sessionState = await getSessionState(session_id, client.id);
    let lastBooking = null;
    if (sessionState.mode === 'rescheduling') {
      lastBooking = await getLastBooking(conversation_id);
    }

    // AI call
    const aiResponse = await getAIReply({
      userMessage: message,
      systemPrompt: client.system_prompt,
      chatHistory: history,
      sessionMode: sessionState.mode,
      collectedData: sessionState.collectedData || {},
      lastBooking,
      businessName: client.business_name,
      businessType: client.business_type || 'general',
      clientPlan: client.plan,
    });

    // Parse system block
    const systemMatch = aiResponse.match(/---SYSTEM---\n([\s\S]*?)\n---END---/);
    let finalReply = aiResponse.replace(/---SYSTEM---[\s\S]*?---END---/g, '').trim();
    let detectedIntent = 'NONE';
    let extractedData = {};

    if (systemMatch) {
      const systemPart = systemMatch[1];
      const intentMatch = systemPart.match(/INTENT:\s*(\w+)/);
      if (intentMatch) detectedIntent = intentMatch[1];
      const dataMatch = systemPart.match(/DATA:\s*({[\s\S]*?})/);
      if (dataMatch) {
        try {
          const parsed = JSON.parse(dataMatch[1]);
          Object.keys(parsed).forEach(k => {
            if (parsed[k]) extractedData[k] = parsed[k];
          });
        } catch (e) {}
      }
    }

    // Intent handling
    if (sessionState.mode === 'normal') {
      if (detectedIntent === 'BOOKING') {
        sessionState = { mode: 'booking', bookingId: null, collectedData: extractedData };
        await setSessionState(session_id, client.id, sessionState);
      } else if (detectedIntent === 'RESCHEDULE') {
        const lb = await getLastBooking(conversation_id);
        if (lb) {
          sessionState = { mode: 'rescheduling', bookingId: lb.id, collectedData: {} };
          await setSessionState(session_id, client.id, sessionState);
          lastBooking = lb;
        }
      }
    }

    // Booking mode
    if (sessionState.mode === 'booking') {
      if (aiResponse.includes('BOOKING_CANCELLED')) {
        await cancelBooking(conversation_id);
        await clearSession(session_id, client.id);
        finalReply = finalReply.replace('BOOKING_CANCELLED', '').trim();
      } else {
        const updatedData = { ...sessionState.collectedData, ...extractedData };
        const complete = isBookingComplete(updatedData, client.business_type || 'general');
        if (complete) {
          await saveBooking(client.id, conversation_id, updatedData);
          await clearSession(session_id, client.id);
        } else {
          await setSessionState(session_id, client.id, {
            ...sessionState, collectedData: updatedData,
          });
        }
      }
    }

    // Reschedule
    if (sessionState.mode === 'rescheduling' && aiResponse.includes('RESCHEDULE_COMPLETE')) {
      const newData = { ...extractedData, name: lastBooking?.customer_name };
      await updateBooking(sessionState.bookingId, newData);
      await clearSession(session_id, client.id);
      finalReply = finalReply.replace('RESCHEDULE_COMPLETE', '').trim();
    }

    // Messages save
    await pool.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversation_id, 'user', message]
    );
    await pool.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversation_id, 'assistant', finalReply]
    );

    // Message count
    await pool.query(
      'UPDATE clients SET messages_used = messages_used + 1 WHERE id = ?',
      [client.id]
    );

    // Facebook pe reply bhejo
    await sendMessage(senderId, finalReply);

  } catch (error) {
    console.error('Process message error:', error.message);
    await sendMessage(senderId, "Sorry, something went wrong. Please try again.");
  }
};