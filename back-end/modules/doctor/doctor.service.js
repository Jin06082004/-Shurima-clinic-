const Doctor = require('./doctor.model');
const User = require('../user/user.model');

class DoctorService {
  async getAllDoctors(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const query = {};
      if (filters.specialization) query.specialization = filters.specialization;
      if (filters.clinicId) query.clinicId = filters.clinicId;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;

      const doctors = await Doctor.find(query)
        .populate('userId', 'fullName email phone avatar department')
        .populate('clinicId', 'name')
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Doctor.countDocuments(query);

      return {
        doctors,
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

  async getDoctorById(doctorId) {
    try {
      const doctor = await Doctor.findById(doctorId)
        .populate('userId', 'fullName email phone avatar department')
        .populate('clinicId', 'name')
        .select('-__v');

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      return doctor;
    } catch (error) {
      throw error;
    }
  }

  async createDoctor(doctorData) {
    try {
      const existingDoctor = await Doctor.findOne({
        licenseNumber: doctorData.licenseNumber,
      });

      if (existingDoctor) {
        throw new Error('Doctor with this license number already exists');
      }

      const doctor = await Doctor.create(doctorData);
      return await this.getDoctorById(doctor._id);
    } catch (error) {
      throw error;
    }
  }

  async updateDoctor(doctorId, updateData) {
    try {
      if (updateData.licenseNumber) {
        const existingDoctor = await Doctor.findOne({
          licenseNumber: updateData.licenseNumber,
          _id: { $ne: doctorId },
        });

        if (existingDoctor) {
          throw new Error('License number already exists');
        }
      }

      const doctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      return await this.getDoctorById(doctor._id);
    } catch (error) {
      throw error;
    }
  }

  async deleteDoctor(doctorId) {
    try {
      const doctor = await Doctor.findByIdAndDelete(doctorId);

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      return { message: 'Doctor deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getDoctorsByClinic(clinicId, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const doctors = await Doctor.find({ clinicId })
        .populate('userId', 'fullName email phone avatar department')
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Doctor.countDocuments({ clinicId });

      return {
        doctors,
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

  async updateDoctorRating(doctorId, newRating) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      const currentTotal = doctor.rating.average * doctor.rating.count;
      const newTotal = currentTotal + newRating;
      const newCount = doctor.rating.count + 1;

      doctor.rating.average = newTotal / newCount;
      doctor.rating.count = newCount;

      await doctor.save();

      return doctor;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DoctorService();
