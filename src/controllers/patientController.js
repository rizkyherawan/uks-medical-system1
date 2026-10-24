// ============================================================
// CONTROLLER: menerima request, memanggil model, mengirim response.
// Format response seragam: { success, message?, data?, errors? }
// ============================================================
const PatientModel = require('../models/patientModel');

// GET /api/patients?search=kata
const getAllPatients = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const patients = await PatientModel.findAll({ search });
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/:id
const getPatientById = async (req, res, next) => {
  try {
    const patient = await PatientModel.findById(req.patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Data pasien tidak ditemukan.' });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// POST /api/patients
const createPatient = async (req, res, next) => {
  try {
    const id = await PatientModel.create(req.body);
    const patient = await PatientModel.findById(id);
    res.status(201).json({ success: true, message: 'Catatan disimpan.', data: patient });
  } catch (err) {
    next(err);
  }
};

// PUT /api/patients/:id
const updatePatient = async (req, res, next) => {
  try {
    const affected = await PatientModel.update(req.patientId, req.body);
    if (!affected) {
      return res.status(404).json({ success: false, message: 'Data pasien tidak ditemukan.' });
    }
    const patient = await PatientModel.findById(req.patientId);
    res.json({ success: true, message: 'Perubahan disimpan.', data: patient });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/patients/:id
const deletePatient = async (req, res, next) => {
  try {
    const affected = await PatientModel.remove(req.patientId);
    if (!affected) {
      return res.status(404).json({ success: false, message: 'Data pasien tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Catatan dihapus.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
