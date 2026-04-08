const adminService = require('./admin.service');
const { validateCreateAdmin, validateUpdateAdmin } = require('./admin.validation');

class AdminController {
  async getAllAdmins(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await adminService.getAllAdmins({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        message: 'Admins retrieved successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAdminById(req, res) {
    try {
      const { id } = req.params;
      const admin = await adminService.getAdminById(id);

      return res.status(200).json({
        success: true,
        message: 'Admin retrieved successfully',
        data: admin,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createAdmin(req, res) {
    try {
      const validation = validateCreateAdmin(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const admin = await adminService.createAdmin(req.body);

      return res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: admin,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateAdmin(req, res) {
    try {
      const { id } = req.params;

      const validation = validateUpdateAdmin(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      }

      const admin = await adminService.updateAdmin(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Admin updated successfully',
        data: admin,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteAdmin(id);

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

  async getActivityLog(req, res) {
    try {
      const { id } = req.params;
      const activityLog = await adminService.getActivityLog(id);

      return res.status(200).json({
        success: true,
        message: 'Activity log retrieved successfully',
        data: activityLog,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async grantPermission(req, res) {
    try {
      const { id } = req.params;
      const { permission } = req.body;

      if (!permission) {
        return res.status(400).json({
          success: false,
          message: 'Permission is required',
        });
      }

      const admin = await adminService.grantPermission(id, permission);

      return res.status(200).json({
        success: true,
        message: 'Permission granted successfully',
        data: admin,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async revokePermission(req, res) {
    try {
      const { id } = req.params;
      const { permission } = req.body;

      if (!permission) {
        return res.status(400).json({
          success: false,
          message: 'Permission is required',
        });
      }

      const admin = await adminService.revokePermission(id, permission);

      return res.status(200).json({
        success: true,
        message: 'Permission revoked successfully',
        data: admin,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AdminController();
