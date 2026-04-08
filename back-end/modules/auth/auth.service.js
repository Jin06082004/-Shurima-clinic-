const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Auth = require('./auth.model');
const User = require('../user/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

class AuthService {
  async register(email, password, userData) {
    try {
      // Check if email already exists
      const existingAuth = await Auth.findOne({ email });
      if (existingAuth) {
        throw new Error('Email already registered');
      }

      // Create user first
      const user = await User.create(userData);

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create auth record
      const auth = await Auth.create({
        userId: user._id,
        email,
        password: hashedPassword,
      });

      return {
        userId: user._id,
        email: auth.email,
        message: 'User registered successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const auth = await Auth.findOne({ email });
      if (!auth) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, auth.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      if (!auth.isActive) {
        throw new Error('Account is inactive');
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: auth.userId, email: auth.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: auth.userId },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login and refresh token
      auth.lastLogin = new Date();
      auth.refreshToken = refreshToken;
      await auth.save();

      const user = await User.findById(auth.userId).select('-__v');

      return {
        accessToken,
        refreshToken,
        userId: auth.userId,
        email: auth.email,
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const auth = await Auth.findOne({ userId: decoded.userId });

      if (!auth || auth.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const newAccessToken = jwt.sign(
        { userId: auth.userId, email: auth.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw error;
    }
  }

  async logout(userId) {
    try {
      await Auth.findOneAndUpdate(
        { userId },
        { refreshToken: null }
      );
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const auth = await Auth.findOne({ userId });
      if (!auth) {
        throw new Error('User not found');
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, auth.password);
      if (!isPasswordValid) {
        throw new Error('Old password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      auth.password = hashedPassword;
      await auth.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
