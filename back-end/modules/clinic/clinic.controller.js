const clinicService = require('./clinic.service');
const { validateCreateClinic, validateUpdateClinic } = require('./clinic.validation');

class ClinicController {
  async getAllClinics(req, res) {
    try {
      const { page = 1, limit = 10, city, isActive } = req.query;

      const filters = {};
      if (city) filters.city = city;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await clinicService.getAllClinics(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        message: 'Clinics retrieved successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getClinicById(req, res) {
    try {
      const { id } = req.params;
      const clinic = await clinicService.getClinicById(id);

      return res.status(200).json({
        success: true,
        message: 'Clinic retrieved successfully',
        data: clinic,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createClinic(req, res) {
    try {
      const validation = validateCreateClinic(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const clinic = await clinicService.createClinic(req.body);

      return res.status(201).json({
        success: true,
        message: 'Clinic created successfully',
        data: clinic,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateClinic(req, res) {
    try {
      const { id } = req.params;

      const validation = validateUpdateClinic(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const clinic = await clinicService.updateClinic(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Clinic updated successfully',
        data: clinic,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteClinic(req, res) {
    try {
      const { id } = req.params;
      const result = await clinicService.deleteClinic(id);

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

  async searchClinics(req, res) {
    try {
      const { search } = req.query;

      if (!search) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required',
        });
      }

      const clinics = await clinicService.searchClinics(search);

      return res.status(200).json({
        success: true,
        message: 'Clinics found',
        data: clinics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ClinicController();
