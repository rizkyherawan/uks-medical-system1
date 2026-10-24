// ============================================================
// KONEKSI BACKEND -> DATABASE
// Satu-satunya file yang tahu cara terhubung ke database.
// Saat migrasi ke PostgreSQL nanti, file ini (dan query di
// folder models) yang perlu diganti; controller & routes aman.
// ============================================================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uks_pmr_wira',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Dipanggil saat server menyala untuk memastikan database bisa diakses.
async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };
