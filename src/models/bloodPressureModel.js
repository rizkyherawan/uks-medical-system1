// ============================================================
// MODEL tensi darah: hanya query SQL, tanpa req/res.
// Pola sama dengan patientModel.js.
// ============================================================
const { pool } = require('../config/db');

const COLUMNS =
  'id, nama_siswa, nisn, kelas, pengukuran_ke, sistolik, diastolik, kategori, created_at, updated_at';

const BloodPressureModel = {
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT ${COLUMNS} FROM blood_pressure_readings ORDER BY created_at DESC, id DESC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ${COLUMNS} FROM blood_pressure_readings WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ nama_siswa, nisn, kelas, pengukuran_ke, sistolik, diastolik, kategori }) {
    const [result] = await pool.execute(
      `INSERT INTO blood_pressure_readings
         (nama_siswa, nisn, kelas, pengukuran_ke, sistolik, diastolik, kategori)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nama_siswa, nisn, kelas, pengukuran_ke, sistolik, diastolik, kategori]
    );
    return result.insertId;
  },

  async update(id, { nama_siswa, nisn, kelas, pengukuran_ke, sistolik, diastolik, kategori }) {
    const [result] = await pool.execute(
      `UPDATE blood_pressure_readings
          SET nama_siswa = ?, nisn = ?, kelas = ?, pengukuran_ke = ?,
              sistolik = ?, diastolik = ?, kategori = ?
        WHERE id = ?`,
      [nama_siswa, nisn, kelas, pengukuran_ke, sistolik, diastolik, kategori, id]
    );
    return result.affectedRows;
  },

  async remove(id) {
    const [result] = await pool.execute('DELETE FROM blood_pressure_readings WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = BloodPressureModel;
