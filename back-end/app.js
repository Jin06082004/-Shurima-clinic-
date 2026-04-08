const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./modules/auth/auth.route'));
app.use('/api/users', require('./modules/user/user.route'));
app.use('/api/doctors', require('./modules/doctor/doctor.route'));
app.use('/api/doctors/schedule', require('./modules/doctor/celander.route'));
app.use('/api/appointments', require('./modules/appointment/appointment.route'));
app.use('/api/clinics', require('./modules/clinic/clinic.route'));
app.use('/api/admin', require('./modules/admin/admin.route'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
