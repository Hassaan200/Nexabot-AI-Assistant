import pool from '../config/db.js';

// Active booking sessions — sirf flow track karne ke liye
const sessions = {};

// Booking extract karo AI response se
export const extractBookingData = (text) => {
  // Yeh function AI ke structured response ko parse karega
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return null;
  } catch {
    return null;
  }
};

export const getSessionState = (sessionId) => {
  return sessions[sessionId] || { 
    mode: 'normal',  // 'normal' | 'booking' | 'rescheduling'
    bookingId: null,
    collectedData: {}
  };
};

export const setSessionState = (sessionId, state) => {
  sessions[sessionId] = state;
};

export const clearSession = (sessionId) => {
  delete sessions[sessionId]; 
};

// Booking DB mein save karo
export const saveBooking = async (clientId, conversationId, data) => {
  const [result] = await pool.query(
    `INSERT INTO bookings 
     (client_id, conversation_id, customer_name, customer_phone, booking_date, booking_time, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
    [
      clientId,
      conversationId,
      data.name || null,
      data.phone || null,
      data.date || null,
      data.time || null,
      data.notes || null
    ]
  );

  // Audit log
  await pool.query(
    `INSERT INTO booking_audit (booking_id, action, new_data)
     VALUES (?, 'created', ?)`,
    [result.insertId, JSON.stringify(data)]
  );

  return result.insertId;
};

// Booking update karo
export const updateBooking = async (bookingId, newData) => {
  // Pehle purana data lo
  const [existing] = await pool.query(
    'SELECT * FROM bookings WHERE id = ?',
    [bookingId]
  );

  if (existing.length === 0) return false;

  const oldData = existing[0];

  await pool.query(
    `UPDATE bookings 
     SET customer_name = ?, booking_date = ?, booking_time = ?, 
         status = 'rescheduled', updated_at = NOW()
     WHERE id = ?`,
    [
      newData.name || oldData.customer_name,
      newData.date || oldData.booking_date,
      newData.time || oldData.booking_time,
      bookingId
    ]
  );

  // Audit log
  await pool.query(
    `INSERT INTO booking_audit (booking_id, action, old_data, new_data)
     VALUES (?, 'rescheduled', ?, ?)`,
    [bookingId, JSON.stringify(oldData), JSON.stringify(newData)]
  );

  return true;
};

// Session ki last booking lo
export const getLastBooking = async (conversationId) => {
  const [rows] = await pool.query(
    `SELECT * FROM bookings 
     WHERE conversation_id = ? 
     AND status IN ('confirmed', 'rescheduled')
     ORDER BY created_at DESC LIMIT 1`,
    [conversationId]
  );
  return rows[0] || null;
};