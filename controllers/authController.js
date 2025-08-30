const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Teacher, GuestTeacher } = require('../models');

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const { name, email, password, role, profileData } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      // Create profile based on role
      let profile = null;
      switch (role) {
        case 'student':
          profile = await Student.create({
            userId: user.id,
            ...profileData
          });
          break;
        case 'teacher':
          profile = await Teacher.create({
            userId: user.id,
            ...profileData
          });
          break;
        case 'guest':
          profile = await GuestTeacher.create({
            userId: user.id,
            ...profileData
          });
          break;
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({
        where: { email, isActive: true },
        include: [
          { association: 'studentProfile', attributes: ['id', 'userId'] },
          { association: 'teacherProfile', attributes: ['id', 'userId'] },
          { association: 'guestTeacherProfile', attributes: ['id', 'userId'] }
        ]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from response
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.userId, {
        include: [
          { association: 'studentProfile', include: ['department', 'course'] },
          { association: 'teacherProfile', include: ['department'] },
          { association: 'guestTeacherProfile', include: ['department'] }
        ],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update profile
  async updateProfile(req, res, next) {
    try {
      const { name, profileData } = req.body;
      const userId = req.user.userId;

      // Update user
      await User.update({ name }, { where: { id: userId } });

      // Update profile based on role
      if (profileData && req.user.role !== 'admin') {
        switch (req.user.role) {
          case 'student':
            await Student.update(profileData, { where: { userId } });
            break;
          case 'teacher':
            await Teacher.update(profileData, { where: { userId } });
            break;
          case 'guest':
            await GuestTeacher.update(profileData, { where: { userId } });
            break;
        }
      }

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Get user
      const user = await User.findByPk(userId);
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.update(
        { password: hashedNewPassword },
        { where: { id: userId } }
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();