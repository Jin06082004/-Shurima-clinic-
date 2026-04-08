const mongoose = require('mongoose');

const celanderSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dayOfWeek: String,
    timeSlots: [
      {
        from: String,
        to: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    isHoliday: {
      type: Boolean,
      default: false,
    },
    note: String,
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
  },
  { timestamps: true }
);

const Celander = mongoose.model('Celander', celanderSchema);

module.exports = Celander;
