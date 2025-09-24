const { GuestTeacher, User, Department, ClassSchedule, Salary, TeachingSession } = require('../models');
const { Op } = require('sequelize');

class GuestTeacherController {
  // Get all guest teachers
  async getAllGuestTeachers(req, res, next) {
    try {
      const { page = 1, limit = 10, department, paymentType, isActive = true } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (department) where.departmentId = department;
      if (paymentType) where.paymentType = paymentType;

      const { count, rows } = await GuestTeacher.findAndCountAll({
        where,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['name', 'email', 'isActive', 'created_at'] 
          },
          { 
            model: Department, 
            as: 'department', 
            attributes: ['name', 'code'] 
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['id', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          guestTeachers: rows,
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

  // Get guest teacher by ID
  async getGuestTeacherById(req, res, next) {
    try {
      const { id } = req.params;

      const guestTeacher = await GuestTeacher.findByPk(id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['name', 'email', 'isActive', 'created_at'] 
          },
          { 
            model: Department, 
            as: 'department' 
          },
          {
            model: Class,
            as: 'classes',
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [
              {
                model: require('../models').Subject,
                as: 'subject',
                attributes: ['name', 'code']
              }
            ]
          },
          {
            model: Salary,
            as: 'salaries',
            limit: 5,
            order: [['month', 'DESC']]
          },
          {
            model: TeachingSession,
            as: 'teachingSessions',
            limit: 10,
            order: [['sessionDate', 'DESC']]
          }
        ]
      });

      if (!guestTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Guest teacher not found'
        });
      }

      res.json({
        success: true,
        data: { guestTeacher }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new guest teacher
  async createGuestTeacher(req, res, next) {
    try {
      const { userData, guestTeacherData } = req.body;

      // Check if user email already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Check if employee ID already exists
      const existingGuestTeacher = await GuestTeacher.findOne({ 
        where: { employeeId: guestTeacherData.employeeId } 
      });
      if (existingGuestTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Guest teacher with this employee ID already exists'
        });
      }

      // Check if department exists
      const department = await Department.findByPk(guestTeacherData.departmentId);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }

      // Create user first
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: 'teacher'
      });

      // Create guest teacher profile
      const guestTeacher = await GuestTeacher.create({
        ...guestTeacherData,
        userId: user.id
      });

      // Fetch complete guest teacher data
      const completeGuestTeacher = await GuestTeacher.findByPk(guestTeacher.id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['name', 'email', 'role'] 
          },
          { 
            model: Department, 
            as: 'department', 
            attributes: ['name', 'code'] 
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Guest teacher created successfully',
        data: { guestTeacher: completeGuestTeacher }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update guest teacher
  async updateGuestTeacher(req, res, next) {
    try {
      const { id } = req.params;
      const { userData, guestTeacherData } = req.body;

      const guestTeacher = await GuestTeacher.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!guestTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Guest teacher not found'
        });
      }

      // Check if user is trying to update their own profile or is admin
      const isAdmin = req.user.role === 'admin';
      const isOwnProfile = req.user.userId === guestTeacher.userId;
      
      if (!isAdmin && !isOwnProfile) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update your own profile' 
        });
      }

      // Check if employee ID is being changed and if it already exists
      if (guestTeacherData && guestTeacherData.employeeId && guestTeacherData.employeeId !== guestTeacher.employeeId) {
        const existingGuestTeacher = await GuestTeacher.findOne({ 
          where: { 
            employeeId: guestTeacherData.employeeId,
            id: { [Op.ne]: id }
          } 
        });
        if (existingGuestTeacher) {
          return res.status(400).json({ 
            success: false, 
            message: 'Employee ID already exists' 
          });
        }
      }

      // Check if email is being changed and if it already exists
      if (userData && userData.email && userData.email !== guestTeacher.user.email) {
        const existingUser = await User.findOne({ 
          where: { 
            email: userData.email,
            id: { [Op.ne]: guestTeacher.userId }
          } 
        });
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already exists' 
          });
        }
      }

      // Check if department exists (if being updated)
      if (guestTeacherData && guestTeacherData.departmentId) {
        const department = await Department.findByPk(guestTeacherData.departmentId);
        if (!department) {
          return res.status(400).json({
            success: false,
            message: 'Department not found'
          });
        }
      }

      // Update user data if provided
      if (userData) {
        // Handle password hashing if password is being updated
        if (userData.password) {
          const bcrypt = require('bcryptjs');
          userData.password = await bcrypt.hash(userData.password, 10);
        }
        
        await User.update(userData, { where: { id: guestTeacher.userId } });
      }

      // Update guest teacher data if provided
      if (guestTeacherData) {
        await GuestTeacher.update(guestTeacherData, { where: { id } });
      }

      // Fetch updated guest teacher data
      const updatedGuestTeacher = await GuestTeacher.findByPk(id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['name', 'email', 'role', 'isActive'] 
          },
          { 
            model: Department, 
            as: 'department', 
            attributes: ['name', 'code'] 
          }
        ]
      });

      res.json({
        success: true,
        message: 'Guest teacher updated successfully',
        data: { guestTeacher: updatedGuestTeacher }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete guest teacher
  async deleteGuestTeacher(req, res, next) {
    try {
      const { id } = req.params;
      const { force = false } = req.query; // Allow force delete

      const guestTeacher = await GuestTeacher.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!guestTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Guest teacher not found'
        });
      }

      // If not force delete, check for dependencies
      if (!force) {
        // Check if guest teacher has class schedules
        const classScheduleCount = await ClassSchedule.count({ where: { guestTeacherId: id } });
        if (classScheduleCount > 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete guest teacher. ${classScheduleCount} class schedule(s) are assigned to this guest teacher. Use ?force=true to force delete.`
          });
        }

        // Check if guest teacher has salary records
        const salaryCount = await Salary.count({ where: { guestTeacherId: id } });
        if (salaryCount > 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete guest teacher. ${salaryCount} salary record(s) exist for this guest teacher. Use ?force=true to force delete.`
          });
        }

        // Check if guest teacher has teaching sessions
        const sessionCount = await TeachingSession.count({ where: { guestTeacherId: id } });
        if (sessionCount > 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete guest teacher. ${sessionCount} teaching session(s) exist for this guest teacher. Use ?force=true to force delete.`
          });
        }
      }

      // Use transaction to ensure data consistency
      const { sequelize } = require('../config/database');
      await sequelize.transaction(async (transaction) => {
        // Delete guest teacher record first (to avoid foreign key constraints)
        await GuestTeacher.destroy({ 
          where: { id }, 
          transaction 
        });
        
        // Delete user record
        await User.destroy({ 
          where: { id: guestTeacher.userId }, 
          transaction 
        });
      });

      res.json({
        success: true,
        message: 'Guest teacher deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Deactivate guest teacher (soft delete alternative)
  async deactivateGuestTeacher(req, res, next) {
    try {
      const { id } = req.params;

      const guestTeacher = await GuestTeacher.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!guestTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Guest teacher not found'
        });
      }

      // Use transaction to ensure data consistency
      const { sequelize } = require('../config/database');
      await sequelize.transaction(async (transaction) => {
        // Deactivate user account
        await User.update(
          { isActive: false }, 
          { where: { id: guestTeacher.userId }, transaction }
        );
      });

      // Fetch updated guest teacher data
      const updatedGuestTeacher = await GuestTeacher.findByPk(id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['name', 'email', 'role', 'isActive'] 
          },
          { 
            model: Department, 
            as: 'department', 
            attributes: ['name', 'code'] 
          }
        ]
      });

      res.json({
        success: true,
        message: 'Guest teacher deactivated successfully',
        data: { guestTeacher: updatedGuestTeacher }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get guest teacher classes
  async getGuestTeacherClasses(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive = true } = req.query;

      const where = { guestTeacherId: id };
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const classSchedules = await ClassSchedule.findAll({
        where,
        include: [
          { 
            model: require('../models').Subject, 
            as: 'subject',
            include: [
              {

                include: [
                  {
                    model: Department,
                    as: 'department',
                    attributes: ['name', 'code']
                  }
                ]
              }
            ]
          }
        ],
        order: [
          ['scheduleDay', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: { classes }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get guest teacher salary history
  async getGuestTeacherSalaryHistory(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await Salary.findAndCountAll({
        where: { guestTeacherId: id },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['month', 'DESC']]
      });

      // Calculate totals
      const totals = await Salary.findAll({
        where: { guestTeacherId: id },
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('base_amount')), 'totalBaseAmount'],
          [require('sequelize').fn('SUM', require('sequelize').col('overtime_amount')), 'totalOvertimeAmount'],
          [require('sequelize').fn('SUM', require('sequelize').col('bonus')), 'totalBonus'],
          [require('sequelize').fn('SUM', require('sequelize').col('deductions')), 'totalDeductions'],
          [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'totalAmount'],
          [require('sequelize').fn('SUM', require('sequelize').col('hours_worked')), 'totalHoursWorked'],
          [require('sequelize').fn('SUM', require('sequelize').col('sessions_taught')), 'totalSessionsTaught']
        ]
      });

      res.json({
        success: true,
        data: {
          salaries: rows,
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

  // Get guest teacher teaching sessions
  async getGuestTeacherTeachingSessions(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const where = { guestTeacherId: id };
      if (startDate && endDate) {
        where.sessionDate = {
          [Op.between]: [startDate, endDate]
        };
      }

      const { count, rows } = await TeachingSession.findAndCountAll({
        where,
        include: [
          {
            model: Class,
            as: 'class',
            include: [
              {
                model: require('../models').Subject,
                as: 'subject',
                attributes: ['name', 'code']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['sessionDate', 'DESC']]
      });

      // Calculate totals
      const totals = await TeachingSession.findAll({
        where: { guestTeacherId: id },
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('hours_taught')), 'totalHoursTaught'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalSessions'],
          [require('sequelize').fn('SUM', require('sequelize').col('students_present')), 'totalStudentsPresent']
        ]
      });

      res.json({
        success: true,
        data: {
          teachingSessions: rows,
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

  // Update guest teacher statistics
  async updateGuestTeacherStats(req, res, next) {
    try {
      const { id } = req.params;

      const guestTeacher = await GuestTeacher.findByPk(id);
      if (!guestTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Guest teacher not found'
        });
      }

      // Calculate total hours taught from teaching sessions
      const totalHoursResult = await TeachingSession.findAll({
        where: { guestTeacherId: id },
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('hours_taught')), 'totalHours']
        ]
      });

      // Calculate total sessions taught
      const totalSessionsResult = await TeachingSession.count({
        where: { guestTeacherId: id }
      });

      const totalHours = parseFloat(totalHoursResult[0].dataValues.totalHours) || 0;
      const totalSessions = totalSessionsResult || 0;

      // Update guest teacher statistics
      await GuestTeacher.update({
        totalHoursTaught: totalHours,
        totalSessionsTaught: totalSessions
      }, { where: { id } });

      // Fetch updated guest teacher
      const updatedGuestTeacher = await GuestTeacher.findByPk(id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['name', 'email'] 
          },
          { 
            model: Department, 
            as: 'department', 
            attributes: ['name', 'code'] 
          }
        ]
      });

      res.json({
        success: true,
        message: 'Guest teacher statistics updated successfully',
        data: { guestTeacher: updatedGuestTeacher }
      });
    } catch (error) {
      next(error);
    }
  }
}

const controller = new GuestTeacherController();

// Bind methods to preserve 'this' context
module.exports = {
  getAllGuestTeachers: controller.getAllGuestTeachers.bind(controller),
  getGuestTeacherById: controller.getGuestTeacherById.bind(controller),
  createGuestTeacher: controller.createGuestTeacher.bind(controller),
  updateGuestTeacher: controller.updateGuestTeacher.bind(controller),
  deleteGuestTeacher: controller.deleteGuestTeacher.bind(controller),
  deactivateGuestTeacher: controller.deactivateGuestTeacher.bind(controller),
  getGuestTeacherClasses: controller.getGuestTeacherClasses.bind(controller),
  getGuestTeacherSalaryHistory: controller.getGuestTeacherSalaryHistory.bind(controller),
  getGuestTeacherTeachingSessions: controller.getGuestTeacherTeachingSessions.bind(controller),
  updateGuestTeacherStats: controller.updateGuestTeacherStats.bind(controller)
};
