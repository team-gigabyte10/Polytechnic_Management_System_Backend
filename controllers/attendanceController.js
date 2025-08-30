const { Attendance, Class, Student, User, Subject, AttendanceRewardFine } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

class AttendanceController {
  // Mark attendance for a class
  async markAttendance(req, res, next) {
    try {
      const { classId, date, attendanceList } = req.body;

      // Verify class exists
      const classExists = await Class.findByPk(classId);
      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      // Process attendance for each student
      const attendancePromises = attendanceList.map(async (attendance) => {
        const { studentId, status } = attendance;

        return await Attendance.upsert({
          classId,
          studentId,
          date,
          status,
          markedBy: req.user.userId,
          markedAt: new Date()
        });
      });

      await Promise.all(attendancePromises);

      // Calculate and update rewards/fines for the month
      await this.calculateMonthlyRewardsAndFines(date);

      res.json({
        success: true,
        message: 'Attendance marked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get attendance for a specific class and date
  async getClassAttendance(req, res, next) {
    try {
      const { classId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required'
        });
      }

      const attendance = await Attendance.findAll({
        where: { classId, date },
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name', 'email']
              }
            ]
          }
        ],
        order: [[{ model: Student, as: 'student' }, 'rollNumber', 'ASC']]
      });

      // Get all students for this class subject and semester
      const classDetails = await Class.findByPk(classId, {
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['courseId', 'semester']
          }
        ]
      });

      const allStudents = await Student.findAll({
        where: {
          courseId: classDetails.subject.courseId,
          semester: classDetails.subject.semester
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }
        ],
        order: [['rollNumber', 'ASC']]
      });

      // Create attendance map
      const attendanceMap = attendance.reduce((map, att) => {
        map[att.studentId] = att;
        return map;
      }, {});

      // Merge students with attendance data
      const studentsWithAttendance = allStudents.map(student => ({
        student,
        attendance: attendanceMap[student.id] || null
      }));

      res.json({
        success: true,
        data: {
          classId,
          date,
          studentsWithAttendance,
          summary: {
            total: allStudents.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get student attendance report
  async getStudentAttendanceReport(req, res, next) {
    try {
      const { studentId } = req.params;
      const { startDate, endDate, subjectId } = req.query;

      const whereCondition = { studentId };
      
      if (startDate && endDate) {
        whereCondition.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      let classWhere = {};
      if (subjectId) {
        classWhere.subjectId = subjectId;
      }

      const attendances = await Attendance.findAll({
        where: whereCondition,
        include: [
          {
            model: Class,
            as: 'class',
            where: classWhere,
            include: [
              {
                model: Subject,
                as: 'subject',
                attributes: ['name', 'code']
              }
            ]
          }
        ],
        order: [['date', 'DESC']]
      });

      // Group by subject
      const subjectWise = attendances.reduce((acc, attendance) => {
        const subjectId = attendance.class.subjectId;
        const subjectName = attendance.class.subject.name;
        
        if (!acc[subjectId]) {
          acc[subjectId] = {
            subject: attendance.class.subject,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            attendances: []
          };
        }
        
        acc[subjectId].total++;
        acc[subjectId][attendance.status]++;
        acc[subjectId].attendances.push(attendance);
        
        return acc;
      }, {});

      // Calculate percentages
      Object.keys(subjectWise).forEach(subjectId => {
        const data = subjectWise[subjectId];
        data.attendancePercentage = data.total > 0 
          ? ((data.present + data.late) / data.total * 100).toFixed(2)
          : 0;
      });

      // Overall summary
      const overallSummary = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length
      };

      overallSummary.attendancePercentage = overallSummary.total > 0 
        ? ((overallSummary.present + overallSummary.late) / overallSummary.total * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          studentId,
          period: { startDate, endDate },
          overallSummary,
          subjectWise: Object.values(subjectWise)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get attendance summary for all students in a class
  async getClassAttendanceSummary(req, res, next) {
    try {
      const { classId } = req.params;
      const { startDate, endDate } = req.query;

      const whereCondition = { classId };
      if (startDate && endDate) {
        whereCondition.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const attendances = await Attendance.findAll({
        where: whereCondition,
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name', 'email']
              }
            ]
          }
        ]
      });

      // Group by student
      const studentWise = attendances.reduce((acc, attendance) => {
        const studentId = attendance.studentId;
        
        if (!acc[studentId]) {
          acc[studentId] = {
            student: attendance.student,
            total: 0,
            present: 0,
            absent: 0,
            late: 0
          };
        }
        
        acc[studentId].total++;
        acc[studentId][attendance.status]++;
        
        return acc;
      }, {});

      // Calculate percentages
      Object.keys(studentWise).forEach(studentId => {
        const data = studentWise[studentId];
        data.attendancePercentage = data.total > 0 
          ? ((data.present + data.late) / data.total * 100).toFixed(2)
          : 0;
      });

      res.json({
        success: true,
        data: {
          classId,
          period: { startDate, endDate },
          students: Object.values(studentWise).sort((a, b) => 
            a.student.rollNumber.localeCompare(b.student.rollNumber)
          )
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Calculate monthly rewards and fines based on attendance
  async calculateMonthlyRewardsAndFines(date) {
    try {
      const month = moment(date).format('YYYY-MM-01');
      const startOfMonth = moment(month).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment(month).endOf('month').format('YYYY-MM-DD');

      // Get all students
      const students = await Student.findAll();

      for (const student of students) {
        // Get attendance for the month
        const attendances = await Attendance.findAll({
          where: {
            studentId: student.id,
            date: {
              [Op.between]: [startOfMonth, endOfMonth]
            }
          }
        });

        if (attendances.length === 0) continue;

        const totalClasses = attendances.length;
        const presentClasses = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
        const attendancePercentage = (presentClasses / totalClasses) * 100;

        // Calculate reward or fine
        let type = null;
        let amount = 0;
        let reason = '';

        if (attendancePercentage >= 95) {
          type = 'reward';
          amount = 500; // Premium reward for excellent attendance
          reason = `Excellent attendance: ${attendancePercentage.toFixed(1)}%`;
        } else if (attendancePercentage >= 85) {
          type = 'reward';
          amount = 200; // Good attendance reward
          reason = `Good attendance: ${attendancePercentage.toFixed(1)}%`;
        } else if (attendancePercentage < 75) {
          type = 'fine';
          amount = 100; // Fine for poor attendance
          reason = `Poor attendance: ${attendancePercentage.toFixed(1)}%`;
        }

        if (type) {
          // Check if already exists for this month
          const existing = await AttendanceRewardFine.findOne({
            where: {
              studentId: student.id,
              month,
              type
            }
          });

          if (!existing) {
            await AttendanceRewardFine.create({
              studentId: student.id,
              type,
              amount,
              reason,
              month,
              attendancePercentage: attendancePercentage.toFixed(2)
            });
          } else {
            // Update existing record
            await existing.update({
              amount,
              reason,
              attendancePercentage: attendancePercentage.toFixed(2)
            });
          }
        }
      }
    } catch (error) {
      console.error('Error calculating monthly rewards and fines:', error);
    }
  }

  // Get attendance rewards and fines
  async getAttendanceRewardsAndFines(req, res, next) {
    try {
      const { studentId, month, type } = req.query;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (studentId) where.studentId = studentId;
      if (month) where.month = month;
      if (type) where.type = type;

      const { count, rows } = await AttendanceRewardFine.findAndCountAll({
        where,
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name', 'email']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          rewardsAndFines: rows,
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

module.exports = new AttendanceController();