const { Salary, Teacher, GuestTeacher, User, TeachingSession, Department } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

class SalaryController {
  // Calculate and generate monthly salaries
  async generateMonthlySalaries(req, res, next) {
    try {
      const { month, year } = req.body;
      const targetMonth = moment(`${year}-${month}-01`).format('YYYY-MM-DD');

      // Generate salaries for regular teachers
      await this.generateTeacherSalaries(targetMonth);
      
      // Generate salaries for guest teachers
      await this.generateGuestTeacherSalaries(targetMonth);

      res.json({
        success: true,
        message: `Salaries generated successfully for ${moment(targetMonth).format('MMMM YYYY')}`
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate regular teacher salaries
  async generateTeacherSalaries(targetMonth) {
    const teachers = await Teacher.findAll({
      include: [
        {
          model: User,
          as: 'user',
          where: { isActive: true }
        }
      ]
    });

    for (const teacher of teachers) {
      // Check if salary already exists for this month
      const existingSalary = await Salary.findOne({
        where: {
          teacherId: teacher.id,
          month: targetMonth
        }
      });

      if (existingSalary) continue;

      // Calculate salary components
      const baseAmount = teacher.salary;
      const bonus = 0; // Can be calculated based on performance
      const deductions = 0; // Can include tax, insurance, etc.
      const totalAmount = baseAmount + bonus - deductions;

      await Salary.create({
        teacherId: teacher.id,
        month: targetMonth,
        baseAmount,
        bonus,
        deductions,
        totalAmount,
        isPaid: false
      });
    }
  }

  // Generate guest teacher salaries
  async generateGuestTeacherSalaries(targetMonth) {
    const startOfMonth = moment(targetMonth).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(targetMonth).endOf('month').format('YYYY-MM-DD');

    const guestTeachers = await GuestTeacher.findAll({
      include: [
        {
          model: User,
          as: 'user',
          where: { isActive: true }
        }
      ]
    });

    for (const guestTeacher of guestTeachers) {
      // Check if salary already exists for this month
      const existingSalary = await Salary.findOne({
        where: {
          guestTeacherId: guestTeacher.id,
          month: targetMonth
        }
      });

      if (existingSalary) continue;

      // Calculate based on teaching sessions for the month
      const sessions = await TeachingSession.findAll({
        where: {
          guestTeacherId: guestTeacher.id,
          sessionDate: {
            [Op.between]: [startOfMonth, endOfMonth]
          },
          status: 'completed'
        }
      });

      let baseAmount = 0;
      let hoursWorked = 0;
      let sessionsTaught = sessions.length;

      sessions.forEach(session => {
        hoursWorked += parseFloat(session.hoursTaught);
      });

      // Calculate amount based on payment type
      switch (guestTeacher.paymentType) {
        case 'hourly':
          baseAmount = hoursWorked * guestTeacher.rate;
          break;
        case 'per_class':
        case 'per_session':
          baseAmount = sessionsTaught * guestTeacher.rate;
          break;
        case 'monthly':
          baseAmount = guestTeacher.rate;
          break;
      }

      const totalAmount = baseAmount; // Guest teachers typically don't have deductions

      await Salary.create({
        guestTeacherId: guestTeacher.id,
        month: targetMonth,
        baseAmount,
        totalAmount,
        hoursWorked,
        sessionsTaught,
        isPaid: false
      });

      // Update guest teacher's total hours and sessions
      await guestTeacher.update({
        totalHoursTaught: guestTeacher.totalHoursTaught + hoursWorked,
        totalSessionsTaught: guestTeacher.totalSessionsTaught + sessionsTaught
      });
    }
  }

  // Get all salaries
  async getAllSalaries(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        month, 
        year, 
        isPaid, 
        teacherType 
      } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (month && year) {
        const targetMonth = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
        where.month = targetMonth;
      }
      if (isPaid !== undefined) {
        where.isPaid = isPaid === 'true';
      }

      // Filter by teacher type
      if (teacherType === 'regular') {
        where.teacherId = { [Op.not]: null };
      } else if (teacherType === 'guest') {
        where.guestTeacherId = { [Op.not]: null };
      }

      const { count, rows } = await Salary.findAndCountAll({
        where,
        include: [
          {
            model: Teacher,
            as: 'teacher',
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
          },
          {
            model: GuestTeacher,
            as: 'guestTeacher',
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
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['month', 'DESC'], ['createdAt', 'DESC']]
      });

      // Calculate summary
      const totalSalaries = await Salary.sum('totalAmount', { where });
      const paidSalaries = await Salary.sum('totalAmount', { 
        where: { ...where, isPaid: true } 
      });
      const pendingSalaries = totalSalaries - (paidSalaries || 0);

      res.json({
        success: true,
        data: {
          salaries: rows,
          summary: {
            total: totalSalaries || 0,
            paid: paidSalaries || 0,
            pending: pendingSalaries
          },
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

  // Mark salary as paid
  async markSalaryAsPaid(req, res, next) {
    try {
      const { id } = req.params;
      const { paymentMethod = 'bank_transfer', paidDate } = req.body;

      const salary = await Salary.findByPk(id);
      if (!salary) {
        return res.status(404).json({
          success: false,
          message: 'Salary record not found'
        });
      }

      if (salary.isPaid) {
        return res.status(400).json({
          success: false,
          message: 'Salary already marked as paid'
        });
      }

      await salary.update({
        isPaid: true,
        paidDate: paidDate || new Date(),
        paymentMethod
      });

      res.json({
        success: true,
        message: 'Salary marked as paid successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update salary
  async updateSalary(req, res, next) {
    try {
      const { id } = req.params;
      const { baseAmount, bonus = 0, deductions = 0 } = req.body;

      const salary = await Salary.findByPk(id);
      if (!salary) {
        return res.status(404).json({
          success: false,
          message: 'Salary record not found'
        });
      }

      if (salary.isPaid) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update paid salary'
        });
      }

      const totalAmount = parseFloat(baseAmount) + parseFloat(bonus) - parseFloat(deductions);

      await salary.update({
        baseAmount,
        bonus,
        deductions,
        totalAmount
      });

      res.json({
        success: true,
        message: 'Salary updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get salary report
  async getSalaryReport(req, res, next) {
    try {
      const { startMonth, endMonth, departmentId } = req.query;

      let dateCondition = {};
      if (startMonth && endMonth) {
        dateCondition = {
          month: {
            [Op.between]: [
              moment(startMonth).format('YYYY-MM-DD'),
              moment(endMonth).format('YYYY-MM-DD')
            ]
          }
        };
      }

      // Regular teachers report
      const teacherSalaries = await Salary.findAll({
        where: {
          teacherId: { [Op.not]: null },
          ...dateCondition
        },
        include: [
          {
            model: Teacher,
            as: 'teacher',
            where: departmentId ? { departmentId } : {},
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
          }
        ]
      });

      // Guest teachers report
      const guestTeacherSalaries = await Salary.findAll({
        where: {
          guestTeacherId: { [Op.not]: null },
          ...dateCondition
        },
        include: [
          {
            model: GuestTeacher,
            as: 'guestTeacher',
            where: departmentId ? { departmentId } : {},
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
          }
        ]
      });

      // Calculate summaries
      const teacherSummary = {
        count: teacherSalaries.length,
        totalAmount: teacherSalaries.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
        paidAmount: teacherSalaries.filter(s => s.isPaid).reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
        pendingAmount: teacherSalaries.filter(s => !s.isPaid).reduce((sum, s) => sum + parseFloat(s.totalAmount), 0)
      };

      const guestTeacherSummary = {
        count: guestTeacherSalaries.length,
        totalAmount: guestTeacherSalaries.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
        paidAmount: guestTeacherSalaries.filter(s => s.isPaid).reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
        pendingAmount: guestTeacherSalaries.filter(s => !s.isPaid).reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
        totalHours: guestTeacherSalaries.reduce((sum, s) => sum + parseFloat(s.hoursWorked || 0), 0),
        totalSessions: guestTeacherSalaries.reduce((sum, s) => sum + parseInt(s.sessionsTaught || 0), 0)
      };

      res.json({
        success: true,
        data: {
          period: { startMonth, endMonth },
          teacherSalaries,
          guestTeacherSalaries,
          summary: {
            teachers: teacherSummary,
            guestTeachers: guestTeacherSummary,
            grandTotal: teacherSummary.totalAmount + guestTeacherSummary.totalAmount,
            grandTotalPaid: teacherSummary.paidAmount + guestTeacherSummary.paidAmount,
            grandTotalPending: teacherSummary.pendingAmount + guestTeacherSummary.pendingAmount
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SalaryController();