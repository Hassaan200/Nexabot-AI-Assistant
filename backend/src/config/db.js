import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
    rejectUnauthorized: false,
  },
    waitForConnections: true,
    connectionLimit: 10,
});

// Test karo ke connection kaam kar raha hai (Using modern async/await syntax or promises)
try {
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully! 🚀');
    conn.release(); // Connection ko wapis pool mai bhejhein
} catch (err) {
    console.error('MySQL connection failed ❌:', err.message);
}

export default pool;