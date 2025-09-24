const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const { User, Student, Teacher, GuestTeacher, Department, Salary, Expense, Attendance, StudentPayment } = require('../models');
const { Op } = require('sequelize');

// Protect all dashboard routes - only admin
router.use(authenticateToken, authorize('admin'));

// GET /api/dashboard
router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    const dateRange = startDate && endDate ? { [Op.between]: [startDate, endDate] } : undefined;

    // Counts
    const [totalStudents, totalTeachers, totalGuestTeachers, totalDepartments] = await Promise.all([
      Student.count(),
      Teacher.count(),
      GuestTeacher.count(),
      Department.count()
    ]);

    // Financials
    const salaryWhere = {};
    if (dateRange) salaryWhere.month = dateRange;
    const [totalSalary, totalSalaryPaid] = await Promise.all([
      Salary.sum('totalAmount', { where: salaryWhere }),
      Salary.sum('totalAmount', { where: { ...salaryWhere, isPaid: true } })
    ]);

    const expenseWhere = {};
    if (dateRange) expenseWhere.expenseDate = dateRange;
    if (departmentId) expenseWhere.departmentId = departmentId;
    const totalExpenses = await Expense.sum('amount', { where: expenseWhere });

    const paymentWhere = {};
    if (dateRange) paymentWhere.created_at = dateRange; // uses underscored timestamps
    const totalStudentPayments = await StudentPayment.sum('amount', { where: paymentWhere });

    // Attendance summary (last 30 days or range)
    const attendanceWhere = {};
    if (dateRange) attendanceWhere.date = dateRange;
    const [attendanceTotal, attendancePresent, attendanceAbsent, attendanceLate] = await Promise.all([
      Attendance.count({ where: attendanceWhere }),
      Attendance.count({ where: { ...attendanceWhere, status: 'present' } }),
      Attendance.count({ where: { ...attendanceWhere, status: 'absent' } }),
      Attendance.count({ where: { ...attendanceWhere, status: 'late' } })
    ]);

    return res.json({
      success: true,
      data: {
        counts: {
          students: totalStudents || 0,
          teachers: totalTeachers || 0,
          guestTeachers: totalGuestTeachers || 0,
          departments: totalDepartments || 0
        },
        financials: {
          salaries: {
            total: Number(totalSalary || 0),
            paid: Number(totalSalaryPaid || 0),
            pending: Number((totalSalary || 0) - (totalSalaryPaid || 0))
          },
          expenses: Number(totalExpenses || 0),
          studentPayments: Number(totalStudentPayments || 0)
        },
        attendance: {
          total: attendanceTotal || 0,
          present: attendancePresent || 0,
          absent: attendanceAbsent || 0,
          late: attendanceLate || 0
        },
        filters: { startDate, endDate, departmentId }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;



