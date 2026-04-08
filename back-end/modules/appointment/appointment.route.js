const express = require('express');
const router = express.Router();
const appointmentController = require('./appointment.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// Specific routes - MUST come before generic /:id routes
router.get('/my/appointments', authMiddleware, appointmentController.getMyAppointments.bind(appointmentController));
router.get('/doctor/:doctorId/appointments', appointmentController.getDoctorAppointments.bind(appointmentController));

// Public routes
router.get('/', appointmentController.getAllAppointments.bind(appointmentController));
router.get('/:id', appointmentController.getAppointmentById.bind(appointmentController));

// Protected routes
router.post('/', authMiddleware, appointmentController.createAppointment.bind(appointmentController));
router.put('/:id', authMiddleware, appointmentController.updateAppointment.bind(appointmentController));
router.patch('/:id/cancel', authMiddleware, appointmentController.cancelAppointment.bind(appointmentController));
router.patch('/:id/complete', authMiddleware, appointmentController.completeAppointment.bind(appointmentController));
router.patch('/:id/rate', authMiddleware, appointmentController.rateAppointment.bind(appointmentController));

module.exports = router;
