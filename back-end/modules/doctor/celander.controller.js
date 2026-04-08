const celanderService = require('./celander.service');
const Doctor = require('./doctor.model');
const { validateCreateCelander, validateUpdateCelander } = require('./celander.validation');

class CelanderController {
  async getAllCelanders(req, res) {
    try {
      const { page = 1, limit = 10, doctorId, startDate, endDate } = req.query;

      const filters = {};
      if (doctorId) filters.doctorId = doctorId;
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }

      const result = await celanderService.getAllCelanders(filters, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return res.status(200).json({
        success: true,
        message: 'Schedules retrieved successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCelanderByDoctor(req, res) {
    try {
      const { doctorId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const celanders = await celanderService.getCelanderByDoctor(
        doctorId,
        new Date(startDate),
        new Date(endDate)
      );

      return res.status(200).json({
        success: true,
        message: 'Schedule retrieved successfully',
        data: celanders,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCelanderByDate(req, res) {
    try {
      const { doctorId, date } = req.params;

      const celander = await celanderService.getCelanderByDate(doctorId, new Date(date));

      return res.status(200).json({
        success: true,
        message: 'Schedule retrieved successfully',
        data: celander,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createCelander(req, res) {
    try {
      if (req.user?.role === 'doctor') {
        const uid = req.user.userId;
        let doctor = await Doctor.findOne({ userId: uid });
        if (!doctor) {
          const licenseNumber = `AUTO-${String(uid)}`;
          try {
            doctor = await Doctor.create({
              userId: uid,
              specialization: 'Chưa phân chuyên khoa',
              licenseNumber,
              qualification: 'Chưa khai báo',
              yearsOfExperience: 0,
            });
          } catch (createErr) {
            if (createErr.code === 11000) {
              doctor = await Doctor.findOne({ userId: uid });
            } else {
              throw createErr;
            }
          }
        }
        if (!doctor) {
          return res.status(400).json({
            success: false,
            message: 'Không tạo/tìm được hồ sơ bác sĩ cho tài khoản này. Liên hệ quản trị.',
          });
        }
        req.body.doctorId = doctor._id.toString();
      }

      const validation = validateCreateCelander(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const celander = await celanderService.createCelander(req.body);

      return res.status(201).json({
        success: true,
        message: 'Schedule created successfully',
        data: celander,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCelander(req, res) {
    try {
      const { id } = req.params;

      const validation = validateUpdateCelander(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const celander = await celanderService.updateCelander(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Schedule updated successfully',
        data: celander,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteCelander(req, res) {
    try {
      const { id } = req.params;
      const result = await celanderService.deleteCelander(id);

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

  async markHoliday(req, res) {
    try {
      const { doctorId, date } = req.params;
      const { note } = req.body;

      const celander = await celanderService.markHoliday(
        doctorId,
        new Date(date),
        note
      );

      return res.status(200).json({
        success: true,
        message: 'Holiday marked successfully',
        data: celander,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async unmarkHoliday(req, res) {
    try {
      const { doctorId, date } = req.params;

      const celander = await celanderService.unmarkHoliday(
        doctorId,
        new Date(date)
      );

      return res.status(200).json({
        success: true,
        message: 'Holiday unmarked successfully',
        data: celander,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CelanderController();
