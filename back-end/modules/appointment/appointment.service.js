const Appointment = require('./appointment.model');

class AppointmentService {
  async getAllAppointments(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.doctorId) query.doctorId = filters.doctorId;
      if (filters.clinicId) query.clinicId = filters.clinicId;

      const appointments = await Appointment.find(query)
        .populate('patientId', 'fullName email phone')
        .populate('doctorId', 'specialization')
        .populate('clinicId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ appointmentDate: 1 })
        .select('-__v');

      const total = await Appointment.countDocuments(query);

      return {
        appointments,
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

  async getAppointmentById(appointmentId) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', 'fullName email phone')
        .populate('doctorId', 'specialization')
        .populate('clinicId', 'name')
        .select('-__v');

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async createAppointment(appointmentData) {
    try {
      // Check for conflicting appointments
      const existingAppointment = await Appointment.findOne({
        doctorId: appointmentData.doctorId,
        appointmentDate: appointmentData.appointmentDate,
        timeSlot: appointmentData.timeSlot,
        status: { $nin: ['cancelled'] },
      });

      if (existingAppointment) {
        throw new Error('This time slot is not available');
      }

      const appointment = await Appointment.create(appointmentData);
      return await this.getAppointmentById(appointment._id);
    } catch (error) {
      throw error;
    }
  }

  async updateAppointment(appointmentId, updateData) {
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return await this.getAppointmentById(appointment._id);
    } catch (error) {
      throw error;
    }
  }

  async cancelAppointment(appointmentId) {
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status: 'cancelled' },
        { new: true }
      );

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async completeAppointment(appointmentId) {
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status: 'completed' },
        { new: true }
      );

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async rateAppointment(appointmentId, rating) {
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { rating, status: 'completed' },
        { new: true }
      );

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async getPatientAppointments(patientId, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const appointments = await Appointment.find({ patientId })
        .populate('doctorId', 'specialization')
        .populate('clinicId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ appointmentDate: -1 })
        .select('-__v');

      const total = await Appointment.countDocuments({ patientId });

      return {
        appointments,
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

  async getDoctorAppointments(doctorId, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const appointments = await Appointment.find({ doctorId })
        .populate('patientId', 'fullName email phone')
        .populate('clinicId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ appointmentDate: 1 })
        .select('-__v');

      const total = await Appointment.countDocuments({ doctorId });

      return {
        appointments,
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
}

module.exports = new AppointmentService();
