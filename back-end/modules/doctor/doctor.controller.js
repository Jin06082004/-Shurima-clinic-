const doctorService = require('./doctor.service');
const { validateCreateDoctor, validateUpdateDoctor } = require('./doctor.validation');

class DoctorController {
  async getAllDoctors(req, res) {
    try {
      const { page = 1, limit = 10, specialization, clinicId, isActive } =
        req.query;

      const filters = {};
      if (specialization) filters.specialization = specialization;
      if (clinicId) filters.clinicId = clinicId;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await doctorService.getAllDoctors(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        message: 'Doctors retrieved successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDoctorById(req, res) {
    try {
      const { id } = req.params;
      const doctor = await doctorService.getDoctorById(id);

      return res.status(200).json({
        success: true,
        message: 'Doctor retrieved successfully',
        data: doctor,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createDoctor(req, res) {
    try {
      const validation = validateCreateDoctor(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const doctor = await doctorService.createDoctor(req.body);

      return res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: doctor,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateDoctor(req, res) {
    try {
      const { id } = req.params;

      const validation = validateUpdateDoctor(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const doctor = await doctorService.updateDoctor(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Doctor updated successfully',
        data: doctor,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteDoctor(req, res) {
    try {
      const { id } = req.params;
      const result = await doctorService.deleteDoctor(id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDoctorsByClinic(req, res) {
    try {
      const { clinicId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await doctorService.getDoctorsByClinic(clinicId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        message: 'Doctors retrieved successfully',
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

module.exports = new DoctorController();
