const express = require('express');
const router = express.Router();
const doctorController = require('./doctor.controller');

// Public routes
router.get('/', doctorController.getAllDoctors.bind(doctorController));
router.get('/:id', doctorController.getDoctorById.bind(doctorController));
router.get('/clinic/:clinicId', doctorController.getDoctorsByClinic.bind(doctorController));

// Admin/Doctor routes
router.post('/', doctorController.createDoctor.bind(doctorController));
router.put('/:id', doctorController.updateDoctor.bind(doctorController));
router.delete('/:id', doctorController.deleteDoctor.bind(doctorController));

module.exports = router;
