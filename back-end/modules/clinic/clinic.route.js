const express = require('express');
const router = express.Router();
const clinicController = require('./clinic.controller');

// Public routes
router.get('/', clinicController.getAllClinics.bind(clinicController));
router.get('/:id', clinicController.getClinicById.bind(clinicController));
router.get('/search', clinicController.searchClinics.bind(clinicController));

// Admin routes
router.post('/', clinicController.createClinic.bind(clinicController));
router.put('/:id', clinicController.updateClinic.bind(clinicController));
router.delete('/:id', clinicController.deleteClinic.bind(clinicController));

module.exports = router;
