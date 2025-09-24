const { Student, User, Department, Attendance, Mark, StudentPayment } = require('../models');
const { Op } = require('sequelize');

class StudentController {
  // Get all students
  async getAllStudents(req, res, next) {
    try {
      const { page = 1, limit = 10, department, semester } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (department) where.departmentId = department;
      if (semester) where.semester = semester;


      const { count, rows } = await Student.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'isActive'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] },

        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['id', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          students: rows,
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

  // Get student by ID
  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['name', 'email', 'isActive', 'createdAt'] 
          },
          { model: Department, as: 'department' },

          {
            model: Attendance,
            as: 'attendances',
            limit: 10,
            order: [['date', 'DESC']],
            include: [
              {
                model: require('../models').Class,
                as: 'class',
                include: [
                  {
                    model: require('../models').Subject,
                    as: 'subject',
                    attributes: ['name', 'code']
                  }
                ]
              }
            ]
          },
          {
            model: Mark,
            as: 'marks',
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: require('../models').Subject,
                as: 'subject',
                attributes: ['name', 'code']
              }
            ]
          }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: { student }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new student
  async createStudent(req, res, next) {
    try {
      const { userData, studentData } = req.body;

      // Check if user email already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Check if roll number already exists
      const existingStudent = await Student.findOne({ 
        where: { rollNumber: studentData.rollNumber } 
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this roll number already exists'
        });
      }

      // Create user first
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: 'student'
      });

      // Create student profile
      const student = await Student.create({
        ...studentData,
        userId: user.id
      });

      // Fetch complete student data
      const completeStudent = await Student.findByPk(student.id, {
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'role'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] },

        ]
      });

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: { student: completeStudent }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update student
  async updateStudent(req, res, next) {
    try {
      const { id } = req.params;
      const { userData, studentData } = req.body;

      const student = await Student.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if user is trying to update their own profile or is admin
      const isAdmin = req.user.role === 'admin';
      const isOwnProfile = req.user.userId === student.userId;
      
      if (!isAdmin && !isOwnProfile) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update your own profile' 
        });
      }

      // Check if roll number is being changed and if it already exists
      if (studentData && studentData.rollNumber && studentData.rollNumber !== student.rollNumber) {
        const existingStudent = await Student.findOne({ 
          where: { 
            rollNumber: studentData.rollNumber,
            id: { [Op.ne]: id }
          } 
        });
        if (existingStudent) {
          return res.status(400).json({ 
            success: false, 
            message: 'Roll number already exists' 
          });
        }
      }

      // Check if email is being changed and if it already exists
      if (userData && userData.email && userData.email !== student.user.email) {
        const existingUser = await User.findOne({ 
          where: { 
            email: userData.email,
            id: { [Op.ne]: student.userId }
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
        await User.update(userData, { where: { id: student.userId } });
      }

      // Update student data if provided
      if (studentData) {
        await Student.update(studentData, { where: { id } });
      }

      // Fetch updated student data
      const updatedStudent = await Student.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'role', 'isActive'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] },

        ]
      });

      res.json({
        success: true,
        message: 'Student updated successfully',
        data: { student: updatedStudent }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete student
  async deleteStudent(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if student has attendance records
      const attendanceCount = await Attendance.count({ where: { studentId: id } });
      if (attendanceCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete student. ${attendanceCount} attendance record(s) exist for this student.`
        });
      }

      // Check if student has marks
      const marksCount = await Mark.count({ where: { studentId: id } });
      if (marksCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete student. ${marksCount} mark record(s) exist for this student.`
        });
      }

      // Check if student has payment records
      const paymentCount = await StudentPayment.count({ where: { studentId: id } });
      if (paymentCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete student. ${paymentCount} payment record(s) exist for this student.`
        });
      }

      // Delete student record first (to avoid foreign key constraints)
      await Student.destroy({ where: { id } });
      
      // Delete user record
      await User.destroy({ where: { id: student.userId } });

      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get student attendance summary
  async getAttendanceSummary(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const whereCondition = { studentId: id };
      if (startDate && endDate) {
        whereCondition.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const attendances = await Attendance.findAll({
        where: whereCondition,
        include: [
          {
            model: require('../models').Class,
            as: 'class',
            include: [
              {
                model: require('../models').Subject,
                as: 'subject',
                attributes: ['name', 'code']
              }
            ]
          }
        ]
      });

      const summary = {
        totalClasses: attendances.length,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length
      };

      summary.attendancePercentage = summary.totalClasses > 0 
        ? ((summary.present + summary.late) / summary.totalClasses * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          summary,
          attendances
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get student payment history
  async getPaymentHistory(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await StudentPayment.findAndCountAll({
        where: { studentId: id },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['id', 'DESC']]
      });

      // Calculate totals
      const totals = await StudentPayment.findAll({
        where: { studentId: id },
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount'],
          [require('sequelize').fn('SUM', require('sequelize').col('late_fee')), 'totalLateFee'],
          [require('sequelize').fn('SUM', require('sequelize').col('discount')), 'totalDiscount']
        ]
      });

      res.json({
        success: true,
        data: {
          payments: rows,
          totals: totals[0],
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
}

const controller = new StudentController();

// Bind methods to preserve 'this' context
module.exports = {
  getAllStudents: controller.getAllStudents.bind(controller),
  getStudentById: controller.getStudentById.bind(controller),
  createStudent: controller.createStudent.bind(controller),
  updateStudent: controller.updateStudent.bind(controller),
  deleteStudent: controller.deleteStudent.bind(controller),
  getAttendanceSummary: controller.getAttendanceSummary.bind(controller),
  getPaymentHistory: controller.getPaymentHistory.bind(controller)
};