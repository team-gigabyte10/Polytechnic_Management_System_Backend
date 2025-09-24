const { Teacher, User, Department, ClassSchedule, Salary } = require('../models');
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

      // Check if user is trying to update their own profile or is admin
      const isAdmin = req.user.role === 'admin';
      const isOwnProfile = req.user.userId === teacher.userId;
      
      if (!isAdmin && !isOwnProfile) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update your own profile' 
        });
      }

      // Check if employeeId is being changed and if it already exists
      if (teacherData && teacherData.employeeId && teacherData.employeeId !== teacher.employeeId) {
        const existingTeacher = await Teacher.findOne({ 
          where: { 
            employeeId: teacherData.employeeId,
            id: { [Op.ne]: id }
          } 
        });
        if (existingTeacher) {
          return res.status(400).json({ 
            success: false, 
            message: 'Employee ID already exists' 
          });
        }
      }

      // Check if email is being changed and if it already exists
      if (userData && userData.email && userData.email !== teacher.user.email) {
        const existingUser = await User.findOne({ 
          where: { 
            email: userData.email,
            id: { [Op.ne]: teacher.userId }
          } 
        });
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already exists' 
          });
        }
      }

      // Update user data if provided
      if (userData) {
        await User.update(userData, { where: { id: teacher.userId } });
      }

      // Update teacher data if provided
      if (teacherData) {
        await Teacher.update(teacherData, { where: { id } });
      }

      // Fetch updated teacher data
      const updatedTeacher = await Teacher.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'role', 'isActive'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] }
        ]
      });

      res.json({ 
        success: true, 
        message: 'Teacher updated successfully',
        data: { teacher: updatedTeacher }
      });
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

      // Check if teacher has class schedules assigned
      const classScheduleCount = await ClassSchedule.count({ where: { teacherId: id } });
      if (classScheduleCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete teacher. ${classScheduleCount} class schedule(s) are assigned to this teacher.`
        });
      }

      // Check if teacher is a department head
      const departmentCount = await Department.count({ where: { headId: id } });
      if (departmentCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete teacher. This teacher is the head of ${departmentCount} department(s).`
        });
      }

      // Delete teacher record first (to avoid foreign key constraints)
      await Teacher.destroy({ where: { id } });
      
      // Delete user record
      await User.destroy({ where: { id: teacher.userId } });

      res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

const controller = new TeacherController();

// Bind methods to preserve 'this' context
module.exports = {
  getAllTeachers: controller.getAllTeachers.bind(controller),
  getTeacherById: controller.getTeacherById.bind(controller),
  createTeacher: controller.createTeacher.bind(controller),
  updateTeacher: controller.updateTeacher.bind(controller),
  deleteTeacher: controller.deleteTeacher.bind(controller)
};
