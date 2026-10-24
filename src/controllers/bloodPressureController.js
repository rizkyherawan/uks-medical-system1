// ============================================================
// CONTROLLER tensi darah. Pola sama dengan patientController.js.
// Kategori SELALU dihitung server (utils/bloodPressure.js), tidak
// pernah diterima dari browser, jadi data tidak bisa dipalsukan.
// ============================================================
const BloodPressureModel = require('../models/bloodPressureModel');
const { CATEGORIES, classify, classifyCode, getCategory } = require('../utils/bloodPressure');

function withCategoryName(row) {
  const category = getCategory(row.kategori);
  return {
    ...row,
    kategori_nama: category ? category.nama : row.kategori,
    kategori_singkat: category ? category.singkat : row.kategori
  };
}

// Mengelompokkan pengukuran per siswa (NISN): tiga slot pengukuran + rata-rata.
// Jika satu siswa punya lebih dari satu data untuk slot yang sama,
// yang dipakai adalah yang terbaru (rows sudah urut terbaru dulu).
function buildSummary(rows) {
  const students = new Map();

  for (const row of rows) {
    if (!students.has(row.nisn)) {
      students.set(row.nisn, {
        nisn: row.nisn,
        nama_siswa: row.nama_siswa,
        kelas: row.kelas,
        pengukuran: [null, null, null]
      });
    }

    const student = students.get(row.nisn);
    const slot = row.pengukuran_ke - 1;

    if (!student.pengukuran[slot]) {
      const named = withCategoryName(row);
      student.pengukuran[slot] = {
        id: row.id,
        sistolik: row.sistolik,
        diastolik: row.diastolik,
        kategori: row.kategori,
        kategori_nama: named.kategori_nama
      };
    }
  }

  return [...students.values()]
    .map((student) => {
      const taken = student.pengukuran.filter(Boolean);
      const jumlah = taken.length;

      let rataRata = null;
      let kategori = null;

      if (jumlah > 0) {
        const sistolik = Math.round(taken.reduce((total, p) => total + p.sistolik, 0) / jumlah);
        const diastolik = Math.round(taken.reduce((total, p) => total + p.diastolik, 0) / jumlah);
        const hasil = classify(sistolik, diastolik);
        rataRata = { sistolik, diastolik };
        kategori = { kode: hasil.kode, nama: hasil.nama };
      }

      return { ...student, jumlah, lengkap: jumlah === 3, rata_rata: rataRata, kategori };
    })
    .sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa, 'id'));
}

// GET /api/blood-pressure/categories
const getCategories = (req, res) => {
  res.json({ success: true, data: CATEGORIES });
};

// GET /api/blood-pressure/classify?sistolik=100&diastolik=70
const classifyValues = (req, res) => {
  res.json({ success: true, data: classify(req.bp.sistolik, req.bp.diastolik) });
};

// GET /api/blood-pressure
const getReadings = async (req, res, next) => {
  try {
    const rows = await BloodPressureModel.findAll();
    const data = rows.map(withCategoryName);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/blood-pressure/summary
const getSummary = async (req, res, next) => {
  try {
    const rows = await BloodPressureModel.findAll();
    const data = buildSummary(rows);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/blood-pressure
const createReading = async (req, res, next) => {
  try {
    const kategori = classifyCode(req.body.sistolik, req.body.diastolik);
    const id = await BloodPressureModel.create({ ...req.body, kategori });
    const row = await BloodPressureModel.findById(id);
    res.status(201).json({ success: true, message: 'Pengukuran disimpan.', data: withCategoryName(row) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/blood-pressure/:id
const updateReading = async (req, res, next) => {
  try {
    const kategori = classifyCode(req.body.sistolik, req.body.diastolik);
    const affected = await BloodPressureModel.update(req.readingId, { ...req.body, kategori });
    if (!affected) {
      return res.status(404).json({ success: false, message: 'Data pengukuran tidak ditemukan.' });
    }
    const row = await BloodPressureModel.findById(req.readingId);
    res.json({ success: true, message: 'Perubahan disimpan.', data: withCategoryName(row) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/blood-pressure/:id
const deleteReading = async (req, res, next) => {
  try {
    const affected = await BloodPressureModel.remove(req.readingId);
    if (!affected) {
      return res.status(404).json({ success: false, message: 'Data pengukuran tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Pengukuran dihapus.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  classifyValues,
  getReadings,
  getSummary,
  createReading,
  updateReading,
  deleteReading,
  buildSummary
};
