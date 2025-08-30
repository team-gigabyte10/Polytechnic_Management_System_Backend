const { Student, User, Department, Course, Attendance, Mark, StudentPayment } = require('../models');
const { Op } = require('sequelize');

class StudentController {
  // Get all students
  async getAllStudents(req, res, next) {
    try {
      const { page = 1, limit = 10, department, semester, course } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (department) where.departmentId = department;
      if (semester) where.semester = semester;
      if (course) where.courseId = course;

      const { count, rows } = await Student.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'isActive'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] },
          { model: Course, as: 'course', attributes: ['name', 'code'] }
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
          { model: Course, as: 'course' },
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
          { model: Course, as: 'course', attributes: ['name', 'code'] }
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

      // Update user data if provided
      if (userData) {
        await User.update(userData, { where: { id: student.userId } });
      }

      // Update student data if provided
      if (studentData) {
        await Student.update(studentData, { where: { id } });
      }

      res.json({
        success: true,
        message: 'Student updated successfully'
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

      // Delete user (student will be deleted due to cascade)
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

module.exports = new StudentController();