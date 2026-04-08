const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    qualification: {
      type: String,
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
    },
    bio: {
      type: String,
      default: null,
    },
    availability: {
      monday: { from: String, to: String },
      tuesday: { from: String, to: String },
      wednesday: { from: String, to: String },
      thursday: { from: String, to: String },
      friday: { from: String, to: String },
      saturday: { from: String, to: String },
      sunday: { from: String, to: String },
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
