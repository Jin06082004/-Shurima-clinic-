const validateCreateAppointment = (data) => {
  const errors = {};

  if (!data.patientId) {
    errors.patientId = 'Patient ID is required';
  }

  if (!data.doctorId) {
    errors.doctorId = 'Doctor ID is required';
  }

  if (!data.clinicId) {
    errors.clinicId = 'Clinic ID is required';
  }

  if (!data.appointmentDate) {
    errors.appointmentDate = 'Appointment date is required';
  }

  if (!data.timeSlot || !data.timeSlot.from || !data.timeSlot.to) {
    errors.timeSlot = 'Time slot (from and to) is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateRateAppointment = (data) => {
  const errors = {};

  if (!data.rating || !data.rating.score) {
    errors['rating.score'] = 'Rating score is required (1-5)';
  } else if (data.rating.score < 1 || data.rating.score > 5) {
    errors['rating.score'] = 'Rating score must be between 1 and 5';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateCreateAppointment,
  validateRateAppointment,
};
