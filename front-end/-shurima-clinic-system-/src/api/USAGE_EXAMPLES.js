// Example usage of API services in React components

import authService from '@/api/authService';
import userService from '@/api/userService';
import doctorService from '@/api/doctorService';
import clinicService from '@/api/clinicService';
import appointmentService from '@/api/appointmentService';
import scheduleService from '@/api/scheduleService';
import adminService from '@/api/adminService';

/**
 * AUTH SERVICE EXAMPLES
 */

// Register a new user
async function handleRegister() {
  try {
    const response = await authService.register({
      email: 'user@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phone: '123456789',
    });
    console.log('Registration successful:', response);
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// Login user
async function handleLogin() {
  try {
    const response = await authService.login('user@example.com', 'password123');
    console.log('Login successful:', response);
    // Tokens are automatically stored in localStorage
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Logout user
async function handleLogout() {
  try {
    const response = await authService.logout();
    console.log('Logout successful:', response);
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

/**
 * USER SERVICE EXAMPLES
 */

// Get all users
async function handleGetUsers() {
  try {
    const response = await userService.getAllUsers(1, 10, {
      role: 'patient',
    });
    console.log('Users:', response.data.users);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

// Get user profile
async function handleGetProfile() {
  try {
    const response = await userService.getProfile();
    console.log('Profile:', response.data);
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}

// Update user profile
async function handleUpdateProfile() {
  try {
    const response = await userService.updateProfile({
      fullName: 'Jane Doe',
      phone: '987654321',
    });
    console.log('Profile updated:', response.data);
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}

/**
 * DOCTOR SERVICE EXAMPLES
 */

// Get all doctors with specialization filter
async function handleGetDoctors() {
  try {
    const response = await doctorService.getAllDoctors(1, 10, {
      specialization: 'Cardiology',
    });
    console.log('Doctors:', response.data.doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
  }
}

// Get doctor by ID
async function handleGetDoctor() {
  try {
    const response = await doctorService.getDoctorById('doctor-id');
    console.log('Doctor:', response.data);
  } catch (error) {
    console.error('Error fetching doctor:', error);
  }
}

/**
 * CLINIC SERVICE EXAMPLES
 */

// Get all clinics
async function handleGetClinics() {
  try {
    const response = await clinicService.getAllClinics(1, 10, {
      city: 'New York',
    });
    console.log('Clinics:', response.data.clinics);
  } catch (error) {
    console.error('Error fetching clinics:', error);
  }
}

// Search clinics
async function handleSearchClinics() {
  try {
    const response = await clinicService.searchClinics('cardiology');
    console.log('Search results:', response.data);
  } catch (error) {
    console.error('Error searching clinics:', error);
  }
}

/**
 * APPOINTMENT SERVICE EXAMPLES
 */

// Create appointment
async function handleCreateAppointment() {
  try {
    const response = await appointmentService.createAppointment({
      patientId: 'patient-id',
      doctorId: 'doctor-id',
      clinicId: 'clinic-id',
      appointmentDate: '2024-05-15T10:00:00Z',
      timeSlot: {
        from: '10:00',
        to: '10:30',
      },
      reason: 'Regular Checkup',
      consultationType: 'in-person',
    });
    console.log('Appointment created:', response.data);
  } catch (error) {
    console.error('Error creating appointment:', error);
  }
}

// Get my appointments
async function handleGetMyAppointments() {
  try {
    const response = await appointmentService.getMyAppointments(1, 10);
    console.log('My appointments:', response.data.appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
  }
}

// Rate appointment
async function handleRateAppointment() {
  try {
    const response = await appointmentService.rateAppointment('appointment-id', {
      score: 5,
      review: 'Excellent service',
      feedback: 'Very professional',
    });
    console.log('Appointment rated:', response.data);
  } catch (error) {
    console.error('Error rating appointment:', error);
  }
}

/**
 * SCHEDULE SERVICE EXAMPLES
 */

// Get doctor's schedule
async function handleGetSchedule() {
  try {
    const response = await scheduleService.getDoctorSchedule(
      'doctor-id',
      '2024-05-01',
      '2024-05-31'
    );
    console.log('Schedule:', response.data);
  } catch (error) {
    console.error('Error fetching schedule:', error);
  }
}

// Mark holiday
async function handleMarkHoliday() {
  try {
    const response = await scheduleService.markHoliday(
      'doctor-id',
      '2024-05-15',
      'Annual Leave'
    );
    console.log('Holiday marked:', response.data);
  } catch (error) {
    console.error('Error marking holiday:', error);
  }
}

/**
 * ADMIN SERVICE EXAMPLES
 */

// Get all admins
async function handleGetAdmins() {
  try {
    const response = await adminService.getAllAdmins(1, 10);
    console.log('Admins:', response.data.admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
  }
}

// Grant permission to admin
async function handleGrantPermission() {
  try {
    const response = await adminService.grantPermission(
      'admin-id',
      'manage_clinics'
    );
    console.log('Permission granted:', response.data);
  } catch (error) {
    console.error('Error granting permission:', error);
  }
}

/**
 * ERROR HANDLING
 * 
 * All services handle errors from the API. Common error codes:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (need to login or token expired)
 * - 404: Not Found
 * - 500: Internal Server Error
 * 
 * The axios interceptor automatically:
 * 1. Adds Authorization header with JWT token
 * 2. Refreshes token if it expires (401 response)
 * 3. Redirects to login if refresh fails
 */

export {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGetUsers,
  handleGetProfile,
  handleUpdateProfile,
  handleGetDoctors,
  handleGetDoctor,
  handleGetClinics,
  handleSearchClinics,
  handleCreateAppointment,
  handleGetMyAppointments,
  handleRateAppointment,
  handleGetSchedule,
  handleMarkHoliday,
  handleGetAdmins,
  handleGrantPermission,
};
