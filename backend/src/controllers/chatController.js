import pool from '../config/db.js';
import { getAIReply } from '../services/aiService.js';
import {
    getSessionState,
    setSessionState,
    clearSession,
    saveBooking,
    updateBooking,
    getLastBooking,
} from '../services/bookingService.js';

const chat = async (req, res) => {
    try {
        const { message, session_id, api_key } = req.body;

        if (!message || !session_id || !api_key) {
            return res.status(400).json({
                error: 'message, session_id aur api_key zaroori hain'
            });
        }

        // 1. Client authenticate karo
        const [clients] = await pool.query(
            'SELECT * FROM clients WHERE api_key = ?',
            [api_key]
        );

        if (clients.length === 0) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        const client = clients[0];

        // Plan expiry check
        if (client.plan_expires_at) {
            const now = new Date();
            const expiry = new Date(client.plan_expires_at);

            if (now > expiry) {
                // Plan expire — account deactivate karo
                await pool.query(
                    'UPDATE clients SET is_active = 0 WHERE id = ?',
                    [client.id]
                );
                return res.status(403).json({
                    error: 'Your plan has expired. Please renew to continue.',
                    code: 'PLAN_EXPIRED'
                });
            }
        }

        // Plan active hai?
        if (!client.is_active) {
            return res.status(403).json({
                error: 'Your subscription has ended. Please upgrade your plan.',
                code: 'PLAN_EXPIRED'
            });
        }

        // Message limit check
        if (client.messages_used >= client.messages_limit) {
            return res.status(429).json({
                error: 'Monthly message limit reached. Please upgrade your plan.',
                code: 'LIMIT_REACHED'
            });
        }

        // Message count update karo — response bhejne se pehle
        await pool.query(
            'UPDATE clients SET messages_used = messages_used + 1 WHERE id = ?',
            [client.id]
        );

        // 2. Conversation lo ya banao
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

        // 3. Chat history lo
        const [history] = await pool.query(
            `SELECT role, content FROM messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC`,
            [conversation_id]
        );

        // 4. Session state lo
        const sessionState = getSessionState(session_id);

        // 5. Reschedule intent check karo
        const rescheduleWords = ['change', 'reschedule', 'badlo', 'update',
            'shift', 'move', 'timing badal'];
        const wantsReschedule = rescheduleWords.some(w =>
            message.toLowerCase().includes(w)
        ) && sessionState.mode === 'normal';

        if (wantsReschedule) {
            const lastBooking = await getLastBooking(conversation_id);
            if (lastBooking) {
                const newState = {
                    mode: 'rescheduling',
                    bookingId: lastBooking.id,
                    collectedData: {}
                };
                setSessionState(session_id, newState);
                // Same request mein bhi updated state use ho
                sessionState.mode = 'rescheduling';
                sessionState.bookingId = lastBooking.id;
                sessionState.lastBooking = lastBooking;
            }
        }

        // 6. Last booking lo agar rescheduling mode mein hain
        let lastBooking = null;
        if (sessionState.mode === 'rescheduling') {
            lastBooking = await getLastBooking(conversation_id);
        }

        // 7. AI ko call karo — session mode ke saath
        const aiResponse = await getAIReply({
            userMessage: message,
            systemPrompt: client.system_prompt,
            chatHistory: history,
            sessionMode: sessionState.mode,
            collectedData: sessionState.collectedData || {},
            lastBooking,
            businessName: client.business_name,
            clientPlan: client.plan,
        });
        console.log('=== RAW AI RESPONSE ===', aiResponse);

        // 8. AI response parse karo
        let finalReply = aiResponse;
        let newMode = sessionState.mode;

        // Booking intent detect karo normal mode mein
        if (sessionState.mode === 'normal') {
            const bookingWords = [
                // Appointment
                'appointment', 'booking', 'book', 'appoint', 'schedule', 'milna', 'visit',
                // Restaurant/Order  
                'order', 'delivery', 'deliver', 'khana', 'food', 'manga', 'mangwana',
                // Salon
                'haircut', 'service', 'treatment',
                // General
                'reserve', 'consultation', 'inquiry'
            ];
            const wantsBooking = bookingWords.some(w =>
                message.toLowerCase().includes(w)
            );
            if (wantsBooking) {
                newMode = 'booking';
                setSessionState(session_id, {
                    mode: 'booking',
                    collectedData: {}
                });
            }
        }

        // Booking complete check karo
        if (aiResponse.includes('BOOKING_COMPLETE')) {
            try {
                const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    const bookingData = JSON.parse(jsonMatch[1]);
                    await saveBooking(client.id, conversation_id, bookingData);
                    clearSession(session_id);
                    newMode = 'normal';
                    // Clean reply — JSON hata do
                    finalReply = aiResponse
                        .replace('BOOKING_COMPLETE', '')
                        .replace(/```json\n[\s\S]*?\n```/, '')
                        .trim();
                }
            } catch (e) {
                console.error('Booking parse error:', e.message);
            }
        }

        // Reschedule complete check karo
        if (aiResponse.includes('RESCHEDULE_COMPLETE')) {
            try {
                console.log('=== RESCHEDULE TRIGGERED ===');
                console.log('Session State:', sessionState);
                console.log('AI Response:', aiResponse);
                const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
                console.log('JSON Match:', jsonMatch);
                if (jsonMatch) {
                    const newData = JSON.parse(jsonMatch[1]);
                    console.log('Parsed Data:', newData);
                    console.log('Booking ID:', sessionState.bookingId);
                    const updated = await updateBooking(sessionState.bookingId, newData);
                    console.log('Update Result:', updated);

                    clearSession(session_id);
                    newMode = 'normal';
                    finalReply = aiResponse
                        .replace('RESCHEDULE_COMPLETE', '')
                        .replace(/```json\n[\s\S]*?\n```/, '')
                        .trim();
                }
            } catch (e) {
                console.error('Reschedule parse error:', e.message);
            }
        }

        // Booking cancelled check karo
        if (aiResponse.includes('BOOKING_CANCELLED')) {
            clearSession(session_id);
            newMode = 'normal';
            finalReply = 'Theek hai, appointment booking cancel kar di. Koi aur madad chahiye?';
        }

        // 9. Messages save karo
        await pool.query(
            'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
            [conversation_id, 'user', message]
        );

        await pool.query(
            'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
            [conversation_id, 'assistant', finalReply]
        );

        res.json({ reply: finalReply, session_id, conversation_id });

    } catch (error) {
        console.error('Chat error:', error.message);
        res.status(500).json({ error: 'Server error aya, dobara try karein.' });
    }
};

export default chat;