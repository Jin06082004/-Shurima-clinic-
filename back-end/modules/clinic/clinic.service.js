const Clinic = require('./clinic.model');

class ClinicService {
  async getAllClinics(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const query = {};
      if (filters.city) query['address.city'] = filters.city;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;

      const clinics = await Clinic.find(query)
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Clinic.countDocuments(query);

      return {
        clinics,
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

  async getClinicById(clinicId) {
    try {
      const clinic = await Clinic.findById(clinicId).select('-__v');

      if (!clinic) {
        throw new Error('Clinic not found');
      }

      return clinic;
    } catch (error) {
      throw error;
    }
  }

  async createClinic(clinicData) {
    try {
      const clinic = await Clinic.create(clinicData);
      return clinic;
    } catch (error) {
      throw error;
    }
  }

  async updateClinic(clinicId, updateData) {
    try {
      const clinic = await Clinic.findByIdAndUpdate(clinicId, updateData, {
        new: true,
        runValidators: true,
      }).select('-__v');

      if (!clinic) {
        throw new Error('Clinic not found');
      }

      return clinic;
    } catch (error) {
      throw error;
    }
  }

  async deleteClinic(clinicId) {
    try {
      const clinic = await Clinic.findByIdAndDelete(clinicId);

      if (!clinic) {
        throw new Error('Clinic not found');
      }

      return { message: 'Clinic deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async searchClinics(searchTerm) {
    try {
      const clinics = await Clinic.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { 'address.city': { $regex: searchTerm, $options: 'i' } },
          { services: { $in: [new RegExp(searchTerm, 'i')] } },
        ],
        isActive: true,
      }).select('-__v');

      return clinics;
    } catch (error) {
      throw error;
    }
  }

  async updateClinicRating(clinicId, newRating) {
    try {
      const clinic = await Clinic.findById(clinicId);

      if (!clinic) {
        throw new Error('Clinic not found');
      }

      const currentTotal = clinic.rating.average * clinic.rating.count;
      const newTotal = currentTotal + newRating;
      const newCount = clinic.rating.count + 1;

      clinic.rating.average = newTotal / newCount;
      clinic.rating.count = newCount;

      await clinic.save();

      return clinic;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ClinicService();
