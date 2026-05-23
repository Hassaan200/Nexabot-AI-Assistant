import pool from '../config/db.js';

// ─── STATS ───────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const clientId = req.clientId;

    const [[totalConversations]] = await pool.query(
      'SELECT COUNT(*) as count FROM conversations WHERE client_id = ?',
      [clientId]
    );

    const [[totalBookings]] = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE client_id = ?',
      [clientId]
    );

    const [[todayBookings]] = await pool.query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE client_id = ? AND DATE(created_at) = CURDATE()`,
      [clientId]
    );

    const [[totalMessages]] = await pool.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.client_id = ?`,
      [clientId]
    );

    const [[clientInfo]] = await pool.query(
      'SELECT messages_used, messages_limit, plan, trial_ends_at FROM clients WHERE id = ?',
      [clientId]
    );

    res.json({
      stats: {
        total_conversations: totalConversations.count,
        total_bookings: totalBookings.count,
        today_bookings: todayBookings.count,
        total_messages: totalMessages.count,
        messages_used: clientInfo.messages_used,
        messages_limit: clientInfo.messages_limit,
        plan: clientInfo.plan,
      }
    });

  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── BOOKINGS ─────────────────────────────────────────────
export const getBookings = async (req, res) => {
  try {
    const clientId = req.clientId;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, c.session_id 
      FROM bookings b
      JOIN conversations c ON b.conversation_id = c.id
      WHERE b.client_id = ?
    `;
    const params = [clientId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [bookings] = await pool.query(query, params);

    // Total count
    const [[total]] = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE client_id = ?',
      [clientId]
    );

    res.json({
      bookings,
      pagination: {
        total: total.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Bookings error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── BOOKING STATUS UPDATE ────────────────────────────────
export const updateBookingStatus = async (req, res) => {
  try {
    const clientId = req.clientId;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify booking is client ki hai
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND client_id = ?',
      [id, clientId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking nahi mili' });
    }

    await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    // Audit log
    await pool.query(
      `INSERT INTO booking_audit (booking_id, action, old_data, new_data)
       VALUES (?, ?, ?, ?)`,
      [
        id,
        status === 'cancelled' ? 'cancelled' : 'updated',
        JSON.stringify({ status: bookings[0].status }),
        JSON.stringify({ status })
      ]
    );

    res.json({ message: `Booking ${status} ho gayi!` });

  } catch (error) {
    console.error('Update booking error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── CONVERSATIONS ────────────────────────────────────────
export const getConversations = async (req, res) => {
  try {
    const clientId = req.clientId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [conversations] = await pool.query(
      `SELECT 
        c.id, c.session_id, c.created_at,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at,
        (SELECT content FROM messages 
         WHERE conversation_id = c.id 
         ORDER BY created_at DESC LIMIT 1) as last_message
       FROM conversations c
       LEFT JOIN messages m ON c.id = m.conversation_id
       WHERE c.client_id = ?
       GROUP BY c.id
       ORDER BY last_message_at DESC
       LIMIT ? OFFSET ?`,
      [clientId, parseInt(limit), parseInt(offset)]
    );

    const [[total]] = await pool.query(
      'SELECT COUNT(*) as count FROM conversations WHERE client_id = ?',
      [clientId]
    );

    res.json({
      conversations,
      pagination: {
        total: total.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Conversations error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── SINGLE CONVERSATION MESSAGES ────────────────────────
export const getConversationMessages = async (req, res) => {
  try {
    const clientId = req.clientId;
    const { id } = req.params;

    // Verify conversation client ki hai
    const [conversations] = await pool.query(
      'SELECT * FROM conversations WHERE id = ? AND client_id = ?',
      [id, clientId]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Conversation nahi mili' });
    }

    const [messages] = await pool.query(
      `SELECT role, content, created_at 
       FROM messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({ messages, conversation: conversations[0] });

  } catch (error) {
    console.error('Messages error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};