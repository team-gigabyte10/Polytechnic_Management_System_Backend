const { Teacher, User, Department, Class, Salary } = require('../models');
const { Op } = require('sequelize');

class TeacherController {
  // Get all teachers
  async getAllTeachers(req, res, next) {
    try {
      const { page = 1, limit = 10, department } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (department) where.departmentId = department;

      const { count, rows } = await Teacher.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'isActive'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        // Order by a guaranteed column to avoid DB field name mapping issues
        order: [['id', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          teachers: rows,
          pagination: {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            perPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get teacher by ID
  async getTeacherById(req, res, next) {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'isActive', 'createdAt'] },
          { model: Department, as: 'department' },
          { model: Class, as: 'classes', limit: 10, order: [['createdAt', 'DESC']] },
          { model: Salary, as: 'salaries', limit: 10, order: [['createdAt', 'DESC']] }
        ]
      });

      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }

      res.json({ success: true, data: { teacher } });
    } catch (error) {
      next(error);
    }
  }

  // Create new teacher
  async createTeacher(req, res, next) {
    try {
      const { userData, teacherData } = req.body;

      // Check if user email already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      // Check if employeeId already exists
      const existingTeacher = await Teacher.findOne({ where: { employeeId: teacherData.employeeId } });
      if (existingTeacher) {
        return res.status(400).json({ success: false, message: 'Teacher with this employee ID already exists' });
      }

      // Create user first
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: 'teacher'
      });

      // Create teacher profile
      const teacher = await Teacher.create({
        ...teacherData,
        userId: user.id
      });

      // Fetch complete teacher data
      const completeTeacher = await Teacher.findByPk(teacher.id, {
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'role'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: { teacher: completeTeacher }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update teacher
  async updateTeacher(req, res, next) {
    try {
      const { id } = req.params;
      const { userData, teacherData } = req.body;

      const teacher = await Teacher.findByPk(id, { include: [{ model: User, as: 'user' }] });
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }

      // Update user data if provided
      if (userData) {
        await User.update(userData, { where: { id: teacher.userId } });
      }

      // Update teacher data if provided
      if (teacherData) {
        await Teacher.update(teacherData, { where: { id } });
      }

      res.json({ success: true, message: 'Teacher updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Delete teacher
  async deleteTeacher(req, res, next) {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(id, { include: [{ model: User, as: 'user' }] });
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }

      // Delete user (teacher will be deleted due to cascade if configured)
      await User.destroy({ where: { id: teacher.userId } });

      res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeacherController();
