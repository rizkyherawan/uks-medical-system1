// ============================================================
// MODEL: hanya berurusan dengan database (query SQL).
// Tidak ada req/res di sini, jadi mudah dites dan dipindah
// ke PostgreSQL (ganti "?" menjadi $1, $2, ... dan tambahkan
// "RETURNING id" pada INSERT).
// ============================================================
const { pool } = require('../config/db');

const COLUMNS = 'id, nama_pasien, nisn, kelas, keluhan, created_at, updated_at';

const PatientModel = {
  async findAll({ search = '' } = {}) {
    let sql = `SELECT ${COLUMNS} FROM patients`;
    const params = [];

    if (search) {
      sql += ' WHERE nama_pasien LIKE ? OR nisn LIKE ? OR kelas LIKE ? OR keluhan LIKE ?';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    sql += ' ORDER BY created_at DESC, id DESC';
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM patients WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async create({ nama_pasien, nisn, kelas, keluhan }) {
    const [result] = await pool.execute(
      'INSERT INTO patients (nama_pasien, nisn, kelas, keluhan) VALUES (?, ?, ?, ?)',
      [nama_pasien, nisn, kelas, keluhan]
    );
    return result.insertId;
  },

  async update(id, { nama_pasien, nisn, kelas, keluhan }) {
    const [result] = await pool.execute(
      'UPDATE patients SET nama_pasien = ?, nisn = ?, kelas = ?, keluhan = ? WHERE id = ?',
      [nama_pasien, nisn, kelas, keluhan, id]
    );
    return result.affectedRows;
  },

  async remove(id) {
    const [result] = await pool.execute('DELETE FROM patients WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = PatientModel;
