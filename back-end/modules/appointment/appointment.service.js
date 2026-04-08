const Appointment = require('./appointment.model');
const { notify, notifyMany } = require('../notification/notification.utils');
const Doctor = require('../doctor/doctor.model');
const User = require('../user/user.model');

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
      const populated = await this.getAppointmentById(appointment._id);

      // === Gửi thông báo cho bác sĩ ===
      try {
        // Lấy thông tin bác sĩ từ Doctor model → userId → User
        const doctorDoc = await Doctor.findById(appointment.doctorId);
        if (doctorDoc && doctorDoc.userId) {
          const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('vi-VN');
          const timeStr = appointment.timeSlot?.from || '';
          const patientInfo = await User.findById(appointment.patientId).select('fullName');
          await notify({
            userId: doctorDoc.userId,
            type: 'appointment_request',
            title: 'Yêu cầu đặt lịch mới',
            message: `Bệnh nhân ${patientInfo?.fullName || 'một bệnh nhân'} muốn đặt lịch khám ngày ${dateStr} ca ${timeStr}. Vui lòng vào xác nhận.`,
            appointmentId: appointment._id,
          });
        }
      } catch (notifErr) {
        console.error('❌ Không gửi được thông báo cho bác sĩ:', notifErr.message);
      }

      return populated;
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

      // === Gửi thông báo cho bệnh nhân ===
      try {
        const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('vi-VN');
        await notify({
          userId: appointment.patientId,
          type: 'appointment_cancelled',
          title: 'Lịch hẹn đã bị hủy',
          message: `Lịch hẹn ngày ${dateStr} đã bị hủy. Vui lòng đặt lịch khác nếu cần.`,
          appointmentId: appointment._id,
        });
      } catch (notifErr) {
        console.error('❌ Không gửi được thông báo hủy cho bệnh nhân:', notifErr.message);
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

      // === Gửi thông báo cho bệnh nhân (bác sĩ đồng ý / hoàn thành) ===
      try {
        const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('vi-VN');
        await notify({
          userId: appointment.patientId,
          type: 'appointment_confirmed',
          title: 'Lịch hẹn đã được xác nhận',
          message: `Bác sĩ đã xác nhận lịch hẹn ngày ${dateStr}. Vui lòng đến đúng giờ.`,
          appointmentId: appointment._id,
        });
      } catch (notifErr) {
        console.error('❌ Không gửi được thông báo cho bệnh nhân:', notifErr.message);
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
