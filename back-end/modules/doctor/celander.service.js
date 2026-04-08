const Celander = require('./celander.model');

class CelanderService {
  async getCelanderByDoctor(doctorId, startDate, endDate) {
    try {
      const celanders = await Celander.find({
        doctorId,
        date: { $gte: startDate, $lte: endDate },
      })
        .populate('appointments', 'patientId appointmentDate status')
        .sort({ date: 1 })
        .select('-__v');

      return celanders;
    } catch (error) {
      throw error;
    }
  }

  async getCelanderByDate(doctorId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const celander = await Celander.findOne({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate('appointments')
        .select('-__v');

      if (!celander) {
        throw new Error('Schedule not found for this date');
      }

      return celander;
    } catch (error) {
      throw error;
    }
  }

  async createCelander(celanderData) {
    try {
      const celander = await Celander.create(celanderData);
      return celander;
    } catch (error) {
      throw error;
    }
  }

  async updateCelander(celanderId, updateData) {
    try {
      const celander = await Celander.findByIdAndUpdate(celanderId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!celander) {
        throw new Error('Schedule not found');
      }

      return celander;
    } catch (error) {
      throw error;
    }
  }

  async deleteCelander(celanderId) {
    try {
      const celander = await Celander.findByIdAndDelete(celanderId);

      if (!celander) {
        throw new Error('Schedule not found');
      }

      return { message: 'Schedule deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async addAppointmentToSlot(celanderId, appointmentId) {
    try {
      const celander = await Celander.findByIdAndUpdate(
        celanderId,
        { $push: { appointments: appointmentId } },
        { new: true }
      );

      if (!celander) {
        throw new Error('Schedule not found');
      }

      return celander;
    } catch (error) {
      throw error;
    }
  }

  async removeAppointmentFromSlot(celanderId, appointmentId) {
    try {
      const celander = await Celander.findByIdAndUpdate(
        celanderId,
        { $pull: { appointments: appointmentId } },
        { new: true }
      );

      if (!celander) {
        throw new Error('Schedule not found');
      }

      return celander;
    } catch (error) {
      throw error;
    }
  }

  async markHoliday(doctorId, date, note) {
    try {
      const celander = await Celander.findOneAndUpdate(
        { doctorId, date },
        { isHoliday: true, note },
        { new: true, upsert: true }
      );

      return celander;
    } catch (error) {
      throw error;
    }
  }

  async unmarkHoliday(doctorId, date) {
    try {
      const celander = await Celander.findOneAndUpdate(
        { doctorId, date },
        { isHoliday: false, note: null },
        { new: true }
      );

      if (!celander) {
        throw new Error('Schedule not found');
      }

      return celander;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CelanderService();
