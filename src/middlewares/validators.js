// ============================================================
// Validasi di sisi server. Validasi di browser hanya kenyamanan,
// yang menjadi penjaga sebenarnya adalah file ini.
// ============================================================
const NISN_PATTERN = /^\d{10}$/;

function validatePatient(req, res, next) {
  const body = req.body || {};

  const data = {
    nama_pasien: String(body.nama_pasien ?? '').trim(),
    nisn: String(body.nisn ?? '').trim(),
    kelas: String(body.kelas ?? '').trim(),
    keluhan: String(body.keluhan ?? '').trim()
  };

  const errors = [];

  if (!data.nama_pasien) errors.push('Nama pasien wajib diisi.');
  else if (data.nama_pasien.length > 100) errors.push('Nama pasien maksimal 100 karakter.');

  if (!data.nisn) errors.push('NISN wajib diisi.');
  else if (!NISN_PATTERN.test(data.nisn)) errors.push('NISN harus 10 digit angka.');

  if (!data.kelas) errors.push('Kelas wajib diisi.');
  else if (data.kelas.length > 20) errors.push('Kelas maksimal 20 karakter.');

  if (!data.keluhan) errors.push('Sakit/keluhan wajib diisi.');
  else if (data.keluhan.length > 1000) errors.push('Sakit/keluhan maksimal 1000 karakter.');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Data belum lengkap atau tidak valid.',
      errors
    });
  }

  req.body = data; // data yang sudah dibersihkan dipakai controller
  next();
}

function validateId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'ID pasien tidak valid.' });
  }

  req.patientId = id;
  next();
}

module.exports = { validatePatient, validateId };
