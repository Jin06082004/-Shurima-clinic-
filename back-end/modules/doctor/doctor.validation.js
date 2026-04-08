const validateCreateDoctor = (data) => {
  const errors = {};

  if (!data.userId) {
    errors.userId = 'User ID is required';
  }

  if (!data.specialization || typeof data.specialization !== 'string') {
    errors.specialization = 'Specialization is required';
  }

  if (!data.licenseNumber || typeof data.licenseNumber !== 'string') {
    errors.licenseNumber = 'License number is required';
  }

  if (!data.qualification || typeof data.qualification !== 'string') {
    errors.qualification = 'Qualification is required';
  }

  if (data.yearsOfExperience && typeof data.yearsOfExperience !== 'number') {
    errors.yearsOfExperience = 'Years of experience must be a number';
  }

  if (data.consultationFee && typeof data.consultationFee !== 'number') {
    errors.consultationFee = 'Consultation fee must be a number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateUpdateDoctor = (data) => {
  const errors = {};

  if (data.specialization && typeof data.specialization !== 'string') {
    errors.specialization = 'Specialization must be a string';
  }

  if (data.licenseNumber && typeof data.licenseNumber !== 'string') {
    errors.licenseNumber = 'License number must be a string';
  }

  if (data.qualification && typeof data.qualification !== 'string') {
    errors.qualification = 'Qualification must be a string';
  }

  if (data.yearsOfExperience && typeof data.yearsOfExperience !== 'number') {
    errors.yearsOfExperience = 'Years of experience must be a number';
  }

  if (data.consultationFee && typeof data.consultationFee !== 'number') {
    errors.consultationFee = 'Consultation fee must be a number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateCreateDoctor,
  validateUpdateDoctor,
};
