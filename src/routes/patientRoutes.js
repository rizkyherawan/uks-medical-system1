const express = require('express');
const controller = require('../controllers/patientController');
const { validatePatient, validateId } = require('../middlewares/validators');

const router = express.Router();

// /api/patients
router
  .route('/')
  .get(controller.getAllPatients)
  .post(validatePatient, controller.createPatient);

// /api/patients/:id
router
  .route('/:id')
  .get(validateId, controller.getPatientById)
  .put(validateId, validatePatient, controller.updatePatient)
  .delete(validateId, controller.deletePatient);

module.exports = router;
