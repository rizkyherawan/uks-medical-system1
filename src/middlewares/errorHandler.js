// 404 untuk endpoint API yang tidak ada
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
}

// Penangan error global (dipanggil lewat next(err))
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // JSON dari klien rusak
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Format JSON tidak valid.' });
  }

  // Database mati / tidak bisa dihubungi
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database tidak dapat dihubungi:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database tidak dapat dihubungi. Pastikan MySQL sedang berjalan.'
    });
  }

  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Terjadi kesalahan pada server.' : err.message
  });
}

module.exports = { notFound, errorHandler };
