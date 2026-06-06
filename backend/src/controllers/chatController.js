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
  getMissingFields,
} from '../services/bookingService.js';

export const chat = async (req, res) => {
  try {
    const { message, session_id, api_key } = req.body;

    if (!message || !session_id || !api_key) {
      return res.status(400).json({
        error: 'message, session_id and api_key are required'
      });
    }

    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE api_key = ?',
      [api_key]
    );

    if (clients.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const client = clients[0];

    if (!client.is_active) {
      return res.status(403).json({
        error: 'Account suspended.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    if (client.messages_used >= client.messages_limit) {
      return res.status(429).json({
        error: 'Monthly message limit reached. Please upgrade your plan.',
        code: 'LIMIT_REACHED'
      });
    }

    if (client.plan_expires_at) {
      const now = new Date();
      const expiry = new Date(client.plan_expires_at);
      if (now > expiry) {
        await pool.query(
          'UPDATE clients SET is_active = 0 WHERE id = ?',
          [client.id]
        );
        return res.status(403).json({
          error: 'Your plan has expired. Please renew.',
          code: 'PLAN_EXPIRED'
        });
      }
    }

    // Conversation
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

    // History
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

    // Missing fields calculate karo
    const missingFields = sessionState.mode === 'booking'
      ? getMissingFields(sessionState.collectedData || {}, client.business_type || 'general')
      : [];

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
      missingFields,
    });

    // Parse system block
    const systemMatch = aiResponse.match(/---SYSTEM---\n([\s\S]*?)\n---END---/);
    let finalReply = aiResponse.replace(/---SYSTEM---[\s\S]*?---END---/g, '').trim();
    let detectedIntent = 'NONE';
    let extractedData = {};

    if (systemMatch) {
      const systemPart = systemMatch[1];

      const intentMatch = systemPart.match(/INTENT:\s*(\w+)/);
      if (intentMatch) detectedIntent = intentMatch[1].trim();

      const dataMatch = systemPart.match(/DATA:\s*(\{[\s\S]*?\})/);
      if (dataMatch) {
        try {
          const parsed = JSON.parse(dataMatch[1]);
          Object.keys(parsed).forEach(k => {
            if (parsed[k] !== null && parsed[k] !== undefined &&
                parsed[k].toString().trim().length > 0) {
              extractedData[k] = parsed[k];
            }
          });
        } catch (e) {
          console.error('JSON parse error:', e.message);
        }
      }
    }

    console.log('Mode:', sessionState.mode, '| Intent:', detectedIntent, '| Data:', extractedData);

    // Normal mode — intent se session set karo
    if (sessionState.mode === 'normal') {
      if (detectedIntent === 'BOOKING') {
        sessionState = {
          mode: 'booking',
          bookingId: null,
          collectedData: extractedData,
        };
        await setSessionState(session_id, client.id, sessionState);

      } else if (detectedIntent === 'RESCHEDULE') {
        const lb = await getLastBooking(conversation_id);
        if (lb) {
          sessionState = {
            mode: 'rescheduling',
            bookingId: lb.id,
            collectedData: {},
          };
          await setSessionState(session_id, client.id, sessionState);
          lastBooking = lb;
        }

      } else if (detectedIntent === 'CANCEL') {
        // Cancel intent normal mode mein
        const lb = await getLastBooking(conversation_id);
        if (lb) {
          sessionState = {
            mode: 'booking',
            bookingId: lb.id,
            collectedData: {},
          };
          await setSessionState(session_id, client.id, sessionState);
        }
      }
    }

    // Booking mode
    if (sessionState.mode === 'booking') {

      // Cancel confirmed
      if (aiResponse.includes('BOOKING_CANCELLED')) {
        const cancelled = await cancelBooking(conversation_id);
        await clearSession(session_id, client.id);
        finalReply = finalReply.replace('BOOKING_CANCELLED', '').trim();

        if (!cancelled) {
          finalReply = "No active booking found to cancel.";
        }
        console.log('Booking cancelled:', cancelled);

      } else {
        // Data merge
        const updatedData = {
          ...sessionState.collectedData,
          ...extractedData,
        };

        console.log('Updated collected data:', updatedData);

        const complete = isBookingComplete(
          updatedData,
          client.business_type || 'general'
        );

        const remaining = getMissingFields(
          updatedData,
          client.business_type || 'general'
        );

        console.log('Complete:', complete, '| Missing:', remaining);

        if (complete) {
          // GUARANTEED save
          const bookingId = await saveBooking(
            client.id, conversation_id, updatedData
          );
          await clearSession(session_id, client.id);
          console.log('BOOKING SAVED — ID:', bookingId, '| Data:', updatedData);

          // Confirm signal add karo reply mein agar AI ne nahi kiya
          if (!finalReply.includes('confirm') && !finalReply.includes('book')) {
            finalReply += '\n\nYour booking has been confirmed! ✅';
          }

        } else {
          // State update with merged data
          await setSessionState(session_id, client.id, {
            ...sessionState,
            collectedData: updatedData,
          });
        }
      }
    }

    // Reschedule mode
    if (sessionState.mode === 'rescheduling' && aiResponse.includes('RESCHEDULE_COMPLETE')) {
      const newData = {
        ...extractedData,
        name: lastBooking?.customer_name,
      };

      const updated = await updateBooking(sessionState.bookingId, newData);
      await clearSession(session_id, client.id);
      finalReply = finalReply.replace('RESCHEDULE_COMPLETE', '').trim();
      console.log('BOOKING RESCHEDULED:', updated, '| Data:', newData);

      if (!finalReply.includes('reschedul') && !finalReply.includes('updat')) {
        finalReply += '\n\nYour booking has been rescheduled! ✅';
      }
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

    res.json({ reply: finalReply, session_id, conversation_id });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { session_id, api_key } = req.query;

    if (!session_id || !api_key) {
      return res.status(400).json({ error: 'session_id and api_key required' });
    }

    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE api_key = ?',
      [api_key]
    );

    if (clients.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const [conversations] = await pool.query(
      'SELECT * FROM conversations WHERE session_id = ? AND client_id = ?',
      [session_id, clients[0].id]
    );

    if (conversations.length === 0) {
      return res.json({ messages: [] });
    }

    const [messages] = await pool.query(
      `SELECT role, content FROM messages 
       WHERE conversation_id = ? ORDER BY created_at ASC`,
      [conversations[0].id]
    );

    res.json({ messages });

  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};