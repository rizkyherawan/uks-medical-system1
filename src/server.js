// .env harus dimuat PERTAMA, sebelum db.js membaca process.env
require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await testConnection();
    console.log('[OK] Terhubung ke database MySQL');
  } catch (err) {
    console.error('[GAGAL] Tidak bisa terhubung ke database:', err.message);
    console.error('        Periksa MySQL sudah menyala dan isi file .env sudah benar.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[OK] Server berjalan di http://localhost:${PORT}`);
  });
}

start();
