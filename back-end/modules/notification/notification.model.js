const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'appointment_request',    // Bệnh nhân yêu cầu đặt lịch
        'appointment_confirmed', // Bác sĩ đồng ý lịch hẹn
        'appointment_cancelled', // Lịch hẹn bị hủy
        'appointment_reminder',  // Nhắc nhở trước lịch hẹn
        'system',               // Thông báo hệ thống
      ],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Liên kết tới appointment để bấm đi tới chi tiết
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index hỗn hợp để query nhanh: userId + isRead
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
