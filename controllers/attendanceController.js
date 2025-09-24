const { Attendance, ClassScheduleSchedule, Student, User, Subject, AttendanceRewardFine, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

class AttendanceController {
  // Mark attendance for a class
  async markAttendance(req, res, next) {
    try {
      const { classScheduleId, date, attendanceList } = req.body;

      // Validate classScheduleId
      if (!classScheduleId || isNaN(classScheduleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid classScheduleId. Must be a valid number.',
          details: { classScheduleId }
        });
      }

      // Verify class schedule exists with detailed information
      const classScheduleExists = await ClassScheduleSchedule.findByPk(classScheduleId, {
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code']
          }
        ]
      });
      
      if (!classScheduleExists) {
        // Get available class schedules for better error message
        const availableClassScheduleSchedules = await ClassScheduleSchedule.findAll({
          attributes: ['id', 'subjectId'],
          include: [
            {
              model: Subject,
              as: 'subject',
              attributes: ['name', 'code']
            }
          ],
          limit: 5
        });

        return res.status(404).json({
          success: false,
          message: `ClassSchedule schedule with ID ${classScheduleId} not found`,
          details: {
            requestedClassScheduleScheduleId: classScheduleId,
            availableClassScheduleSchedules: availableClassScheduleSchedules.length > 0 ? availableClassScheduleSchedules.map(c => ({
              id: c.id,
              subject: c.subject ? `${c.subject.name} (${c.subject.code})` : 'No subject'
            })) : 'No class schedules available in the system'
          },
          suggestion: availableClassScheduleSchedules.length > 0
            ? 'Please use one of the available class schedule IDs listed above'
            : 'No class schedules exist in the system. Please create class schedules first.'
        });
      }

      // Process attendance for each student
      const attendancePromises = attendanceList.map(async (attendance) => {
        const { studentId, status } = attendance;

        return await Attendance.upsert({
          classScheduleId,
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
  async getClassScheduleAttendance(req, res, next) {
    try {
      const { classScheduleId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required'
        });
      }

      const attendance = await Attendance.findAll({
        where: { classScheduleId, date },
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
      const classDetails = await ClassSchedule.findByPk(classScheduleId, {
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['departmentId', 'semester']
          }
        ]
      });

      if (!classDetails) {
        return res.status(404).json({
          success: false,
          message: 'ClassSchedule not found'
        });
      }

      if (!classDetails.subject) {
        return res.status(400).json({
          success: false,
          message: 'ClassSchedule does not have an associated subject'
        });
      }

      const allStudents = await Student.findAll({
        where: {
          departmentId: classDetails.subject.departmentId,
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
          classScheduleId,
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
            model: ClassSchedule,
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
        // Check if class and subject exist
        if (!attendance.class || !attendance.class.subject) {
          console.warn(`Attendance ${attendance.id} has missing class or subject data`);
          return acc;
        }

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
  async getClassScheduleAttendanceSummary(req, res, next) {
    try {
      const { classScheduleId } = req.params;
      const { startDate, endDate } = req.query;

      const whereCondition = { classScheduleId };
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
          classScheduleId,
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

        const totalClassSchedulees = attendances.length;
        const presentClassSchedulees = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
        const attendancePercentage = (presentClassSchedulees / totalClassSchedulees) * 100;

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

  // Get attendance statistics for dashboard
  async getAttendanceStatistics(req, res, next) {
    try {
      const { startDate, endDate, departmentId, semester } = req.query;
      
      const whereCondition = {};
      if (startDate && endDate) {
        whereCondition.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      // Get overall statistics
      const totalAttendance = await Attendance.count({
        where: whereCondition
      });

      const presentCount = await Attendance.count({
        where: {
          ...whereCondition,
          status: 'present'
        }
      });

      const absentCount = await Attendance.count({
        where: {
          ...whereCondition,
          status: 'absent'
        }
      });

      const lateCount = await Attendance.count({
        where: {
          ...whereCondition,
          status: 'late'
        }
      });

      // Get department-wise statistics if departmentId is provided
      let departmentStats = null;
      if (departmentId) {
        const departmentAttendance = await Attendance.findAll({
          where: whereCondition,
          include: [
            {
              model: ClassSchedule,
              as: 'class',
              include: [
                {
                  model: Subject,
                  as: 'subject',
                  where: { departmentId }
                }
              ]
            }
          ]
        });

        const deptPresent = departmentAttendance.filter(a => a.status === 'present').length;
        const deptAbsent = departmentAttendance.filter(a => a.status === 'absent').length;
        const deptLate = departmentAttendance.filter(a => a.status === 'late').length;

        departmentStats = {
          total: departmentAttendance.length,
          present: deptPresent,
          absent: deptAbsent,
          late: deptLate,
          attendancePercentage: departmentAttendance.length > 0 
            ? ((deptPresent + deptLate) / departmentAttendance.length * 100).toFixed(2)
            : 0
        };
      }

      // Get recent attendance trends (last 7 days)
      const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      
      const recentTrends = await Attendance.findAll({
        where: {
          date: {
            [Op.between]: [sevenDaysAgo, today]
          }
        },
        attributes: [
          'date',
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['date', 'status'],
        order: [['date', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          overall: {
            total: totalAttendance,
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            attendancePercentage: totalAttendance > 0 
              ? ((presentCount + lateCount) / totalAttendance * 100).toFixed(2)
              : 0
          },
          department: departmentStats,
          recentTrends: recentTrends
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update attendance record
  async updateAttendance(req, res, next) {
    try {
      const { attendanceId } = req.params;
      const { status } = req.body;

      const attendance = await Attendance.findByPk(attendanceId);
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      await attendance.update({
        status,
        markedBy: req.user.userId,
        markedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete attendance record
  async deleteAttendance(req, res, next) {
    try {
      const { attendanceId } = req.params;

      const attendance = await Attendance.findByPk(attendanceId);
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      await attendance.destroy();

      res.json({
        success: true,
        message: 'Attendance record deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get attendance calendar for a class
  async getAttendanceCalendar(req, res, next) {
    try {
      const { classScheduleId } = req.params;
      const { month, year } = req.query;

      const targetMonth = month || moment().month() + 1;
      const targetYear = year || moment().year();
      
      const startOfMonth = moment(`${targetYear}-${targetMonth}-01`).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment(`${targetYear}-${targetMonth}-01`).endOf('month').format('YYYY-MM-DD');

      const attendances = await Attendance.findAll({
        where: {
          classScheduleId,
          date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'rollNumber'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name']
              }
            ]
          }
        ],
        order: [['date', 'ASC'], [{ model: Student, as: 'student' }, 'rollNumber', 'ASC']]
      });

      // Group by date
      const calendarData = attendances.reduce((acc, attendance) => {
        const date = attendance.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(attendance);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          classScheduleId,
          month: targetMonth,
          year: targetYear,
          calendarData
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk update attendance
  async bulkUpdateAttendance(req, res, next) {
    try {
      const { classScheduleId, date, updates } = req.body;

      // Verify class exists
      const classExists = await ClassSchedule.findByPk(classScheduleId);
      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'ClassSchedule not found'
        });
      }

      // Process bulk updates
      const updatePromises = updates.map(async (update) => {
        const { studentId, status } = update;
        
        return await Attendance.upsert({
          classScheduleId,
          studentId,
          date,
          status,
          markedBy: req.user.userId,
          markedAt: new Date()
        });
      });

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Bulk attendance update completed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get available classes for attendance marking
  async getAvailableClassSchedules(req, res, next) {
    try {
      const { active = true } = req.query;

      const whereCondition = {};
      if (active !== undefined) {
        whereCondition.isActive = active === 'true';
      }

      const classes = await ClassSchedule.findAll({
        where: whereCondition,
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code', 'semester']
          },
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'employeeId', 'designation']
          },
          {
            model: GuestTeacher,
            as: 'guestTeacher',
            attributes: ['id', 'employeeId']
          }
        ],
        order: [
          ['scheduleDay', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      const formattedClassSchedulees = classes.map(cls => ({
        id: cls.id,
        subject: {
          id: cls.subject.id,
          name: cls.subject.name,
          code: cls.subject.code,
          semester: cls.subject.semester
        },
        teacher: cls.teacher ? {
          id: cls.teacher.id,
          employeeId: cls.teacher.employeeId,
          designation: cls.teacher.designation
        } : null,
        guestTeacher: cls.guestTeacher ? {
          id: cls.guestTeacher.id,
          employeeId: cls.guestTeacher.employeeId
        } : null,
        roomNumber: cls.roomNumber,
        schedule: {
          day: cls.scheduleDay,
          startTime: cls.startTime,
          endTime: cls.endTime
        },
        classType: cls.classType,
        isActive: cls.isActive
      }));

      res.json({
        success: true,
        data: {
          classes: formattedClassSchedulees,
          total: formattedClassSchedulees.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttendanceController();