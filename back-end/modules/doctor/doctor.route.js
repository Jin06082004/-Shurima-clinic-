const express = require('express');
const router = express.Router();
const doctorController = require('./doctor.controller');

// Specific routes - MUST come before generic /:id routes
router.get('/clinic/:clinicId', doctorController.getDoctorsByClinic.bind(doctorController));

// Public routes
router.get('/', doctorController.getAllDoctors.bind(doctorController));
router.get('/:id', doctorController.getDoctorById.bind(doctorController));

// Admin/Doctor routes
router.post('/', doctorController.createDoctor.bind(doctorController));
router.put('/:id', doctorController.updateDoctor.bind(doctorController));
router.delete('/:id', doctorController.deleteDoctor.bind(doctorController));

module.exports = router;
