import pool from '../config/db.js';

const requiredFields = {
  clinic:     ['name', 'date', 'time', 'phone'],
  restaurant: ['name', 'order', 'address', 'phone'],
  salon:      ['name', 'service', 'date', 'time', 'phone'],
  general:    ['name', 'date', 'time', 'phone'],
};

export const getSessionState = async (sessionId, clientId) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sessions WHERE session_id = ? AND client_id = ?',
      [sessionId, clientId]
    );
    if (rows.length === 0) {
      return { mode: 'normal', bookingId: null, collectedData: {} };
    }
    return {
      mode: rows[0].mode || 'normal',
      bookingId: rows[0].booking_id || null,
      collectedData: rows[0].collected_data || {},
    };
  } catch {
    return { mode: 'normal', bookingId: null, collectedData: {} };
  }
};

export const setSessionState = async (sessionId, clientId, state) => {
  await pool.query(
    `INSERT INTO sessions (session_id, client_id, mode, booking_id, collected_data)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
     mode = VALUES(mode),
     booking_id = VALUES(booking_id),
     collected_data = VALUES(collected_data),
     updated_at = NOW()`,
    [
      sessionId, clientId,
      state.mode || 'normal',
      state.bookingId || null,
      JSON.stringify(state.collectedData || {}),
    ]
  );
};

export const clearSession = async (sessionId, clientId) => {
  await pool.query(
    `INSERT INTO sessions (session_id, client_id, mode, booking_id, collected_data)
     VALUES (?, ?, 'normal', NULL, '{}')
     ON DUPLICATE KEY UPDATE
     mode = 'normal', booking_id = NULL, collected_data = '{}', updated_at = NOW()`,
    [sessionId, clientId]
  );
};

export const isBookingComplete = (collectedData, businessType) => {
  const fields = requiredFields[businessType] || requiredFields.general;
  return fields.every(field =>
    collectedData[field] &&
    collectedData[field].toString().trim().length > 0
  );
};

export const getMissingFields = (collectedData, businessType) => {
  const fields = requiredFields[businessType] || requiredFields.general;
  return fields.filter(field =>
    !collectedData[field] ||
    collectedData[field].toString().trim().length === 0
  );
};

export const saveBooking = async (clientId, conversationId, data) => {
  const [result] = await pool.query(
    `INSERT INTO bookings 
     (client_id, conversation_id, customer_name, customer_phone,
      booking_date, booking_time, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
    [
      clientId, conversationId,
      data.name || null,
      data.phone || null,
      data.date || null,
      data.time || null,
      [data.notes, data.order, data.service, data.address]
        .filter(Boolean).join(' | ') || null,
    ]
  );

  await pool.query(
    `INSERT INTO booking_audit (booking_id, action, new_data)
     VALUES (?, 'created', ?)`,
    [result.insertId, JSON.stringify(data)]
  );

  return result.insertId;
};

export const updateBooking = async (bookingId, newData) => {
  if (!bookingId) return false;

  const [existing] = await pool.query(
    'SELECT * FROM bookings WHERE id = ?',
    [bookingId]
  );

  if (existing.length === 0) return false;
  const old = existing[0];

  await pool.query(
    `UPDATE bookings 
     SET customer_name = ?, booking_date = ?, booking_time = ?,
         notes = ?, status = 'rescheduled', updated_at = NOW()
     WHERE id = ?`,
    [
      newData.name || old.customer_name,
      newData.date || old.booking_date,
      newData.time || old.booking_time,
      newData.notes || old.notes,
      bookingId,
    ]
  );

  await pool.query(
    `INSERT INTO booking_audit (booking_id, action, old_data, new_data)
     VALUES (?, 'rescheduled', ?, ?)`,
    [bookingId, JSON.stringify(old), JSON.stringify(newData)]
  );

  return true;
};

export const cancelBooking = async (conversationId) => {
  try {
    const [bookings] = await pool.query(
      `SELECT * FROM bookings 
       WHERE conversation_id = ? 
       AND status IN ('confirmed', 'rescheduled')
       ORDER BY created_at DESC LIMIT 1`,
      [conversationId]
    );

    if (bookings.length === 0) return false;

    await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW()
       WHERE id = ?`,
      [bookings[0].id]
    );

    await pool.query(
      `INSERT INTO booking_audit (booking_id, action, old_data, new_data)
       VALUES (?, 'cancelled', ?, ?)`,
      [
        bookings[0].id,
        JSON.stringify({ status: bookings[0].status }),
        JSON.stringify({ status: 'cancelled' }),
      ]
    );

    return true;
  } catch (error) {
    console.error('Cancel error:', error.message);
    return false;
  }
};

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