const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      from: String,
      to: String,
    },
    reason: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
      default: 'scheduled',
    },
    consultationType: {
      type: String,
      enum: ['in-person', 'online'],
      default: 'in-person',
    },
    consultationLink: {
      type: String,
      default: null,
    },
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      feedback: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
