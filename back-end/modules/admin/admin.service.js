const Admin = require('./admin.model');
const User = require('../user/user.model');

class AdminService {
  async getAllAdmins(pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const admins = await Admin.find()
        .populate('userId', 'fullName email')
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Admin.countDocuments();

      return {
        admins,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getAdminById(adminId) {
    try {
      const admin = await Admin.findById(adminId)
        .populate('userId', 'fullName email')
        .select('-__v');

      if (!admin) {
        throw new Error('Admin not found');
      }

      return admin;
    } catch (error) {
      throw error;
    }
  }

  async createAdmin(adminData) {
    try {
      const admin = await Admin.create(adminData);
      return await this.getAdminById(admin._id);
    } catch (error) {
      throw error;
    }
  }

  async updateAdmin(adminId, updateData) {
    try {
      const admin = await Admin.findByIdAndUpdate(adminId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!admin) {
        throw new Error('Admin not found');
      }

      return await this.getAdminById(admin._id);
    } catch (error) {
      throw error;
    }
  }

  async deleteAdmin(adminId) {
    try {
      const admin = await Admin.findByIdAndDelete(adminId);

      if (!admin) {
        throw new Error('Admin not found');
      }

      return { message: 'Admin deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async logActivity(adminId, action, targetType, targetId, details) {
    try {
      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error('Admin not found');
      }

      admin.activityLog.push({
        action,
        targetType,
        targetId,
        details,
        timestamp: new Date(),
      });

      await admin.save();
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async getActivityLog(adminId) {
    try {
      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error('Admin not found');
      }

      return admin.activityLog;
    } catch (error) {
      throw error;
    }
  }

  async grantPermission(adminId, permission) {
    try {
      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error('Admin not found');
      }

      if (!admin.permissions.includes(permission)) {
        admin.permissions.push(permission);
        await admin.save();
      }

      return admin;
    } catch (error) {
      throw error;
    }
  }

  async revokePermission(adminId, permission) {
    try {
      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error('Admin not found');
      }

      admin.permissions = admin.permissions.filter((p) => p !== permission);
      await admin.save();

      return admin;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdminService();
