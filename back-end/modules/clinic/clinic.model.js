const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    operatingHours: {
      monday: { from: String, to: String },
      tuesday: { from: String, to: String },
      wednesday: { from: String, to: String },
      thursday: { from: String, to: String },
      friday: { from: String, to: String },
      saturday: { from: String, to: String },
      sunday: { from: String, to: String },
    },
    services: [String],
    facilities: [String],
    logo: {
      type: String,
      default: null,
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

const Clinic = mongoose.model('Clinic', clinicSchema);

module.exports = Clinic;
