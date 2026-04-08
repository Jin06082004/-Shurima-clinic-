const appointmentService = require('./appointment.service');
const { validateCreateAppointment, validateRateAppointment } = require('./appointment.validation');

class AppointmentController {
  async getAllAppointments(req, res) {
    try {
      const { page = 1, limit = 10, status, patientId, doctorId, clinicId } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (patientId) filters.patientId = patientId;
      if (doctorId) filters.doctorId = doctorId;
      if (clinicId) filters.clinicId = clinicId;

      const result = await appointmentService.getAllAppointments(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.getAppointmentById(id);

      return res.status(200).json({
        success: true,
        message: 'Appointment retrieved successfully',
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createAppointment(req, res) {
    try {
      const validation = validateCreateAppointment(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const appointment = await appointmentService.createAppointment(req.body);

      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.updateAppointment(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.cancelAppointment(id);

      return res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async completeAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.completeAppointment(id);

      return res.status(200).json({
        success: true,
        message: 'Appointment completed successfully',
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async rateAppointment(req, res) {
    try {
      const { id } = req.params;

      const validation = validateRateAppointment(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const appointment = await appointmentService.rateAppointment(id, req.body.rating);

      return res.status(200).json({
        success: true,
        message: 'Appointment rated successfully',
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyAppointments(req, res) {
    try {
      const patientId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;

      const result = await appointmentService.getPatientAppointments(patientId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        message: 'My appointments retrieved successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDoctorAppointments(req, res) {
    try {
      const { doctorId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await appointmentService.getDoctorAppointments(doctorId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        message: 'Doctor appointments retrieved successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AppointmentController();
