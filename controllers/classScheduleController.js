const { ClassSchedule, Subject, Teacher, GuestTeacher, Department, Attendance, User } = require('../models');
const { Op } = require('sequelize');

class ClassScheduleController {
  // Simple endpoint to get all schedules without complex includes
  async getAllClassSchedulesSimple(req, res, next) {
    try {
      const schedules = await ClassSchedule.findAll({
        attributes: ['id', 'subjectId', 'teacherId', 'guestTeacherId', 'roomNumber', 'scheduleDay', 'startTime', 'endTime', 'classType', 'semester', 'academicYear', 'isActive']
      });
      
      res.json({
        success: true,
        data: {
          schedules,
          total: schedules.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all class schedules with filtering and pagination
  async getAllClassSchedules(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        department, 
        subject, 
        teacher, 
        day, 
        classType,
        semester,
        academicYear,
        isActive 
      } = req.query;
      
      const offset = (page - 1) * limit;
      const where = {};

      // Build where conditions
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (day) where.scheduleDay = day;
      if (classType) where.classType = classType;
      if (semester) where.semester = semester;
      if (academicYear) where.academicYear = academicYear;

      // First, let's try without any includes to see if we get data
      const { count, rows } = await ClassSchedule.findAndCountAll({
        where: {}, // Remove all filters for now
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['academicYear', 'DESC'],
          ['semester', 'ASC'],
          ['scheduleDay', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: {
          classes: rows,
          pagination: {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            perPage: parseInt(limit)
          }
        }
      });
      return;
    } catch (error) {
      next(error);
    }
  }

  // Get class schedule by ID
  async getClassScheduleById(req, res, next) {
    try {
      const { id } = req.params;

      const classSchedule = await ClassSchedule.findByPk(id, {
        include: [
          { 
            model: Subject, 
            as: 'subject',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          },
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
                as: 'department'
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
                as: 'department'
              }
            ]
          },
          {
            model: User,
            as: 'creator',
            attributes: ['name', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['name', 'email']
          },
          {
            model: Attendance,
            as: 'attendances',
            limit: 10,
            order: [['date', 'DESC']],
            include: [
              {
                model: require('../models').Student,
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
            ]
          }
        ]
      });

      if (!classSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Class schedule not found'
        });
      }

      res.json({
        success: true,
        data: { class: classSchedule }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new class schedule
  async createClassSchedule(req, res, next) {
    try {
      const classScheduleData = req.body;
      classScheduleData.createdBy = req.user.id;

      // Validate teacher assignment
      if (classScheduleData.teacherId && classScheduleData.guestTeacherId) {
        return res.status(400).json({
          success: false,
          message: 'Class schedule cannot have both a teacher and a guest teacher at the same time'
        });
      }

      // Ensure at least one teacher is assigned
      if (!classScheduleData.teacherId && !classScheduleData.guestTeacherId) {
        return res.status(400).json({
          success: false,
          message: 'Either a teacher or guest teacher must be assigned to the class schedule'
        });
      }

      // Check if subject exists
      const subject = await Subject.findByPk(classScheduleData.subjectId);
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Subject not found'
        });
      }

      // Check if teacher exists (if provided)
      if (classScheduleData.teacherId) {
        const teacher = await Teacher.findByPk(classScheduleData.teacherId);
        if (!teacher) {
          return res.status(400).json({
            success: false,
            message: 'Teacher not found'
          });
        }
      }

      // Check if guest teacher exists (if provided)
      if (classScheduleData.guestTeacherId) {
        const guestTeacher = await GuestTeacher.findByPk(classScheduleData.guestTeacherId);
        if (!guestTeacher) {
          return res.status(400).json({
            success: false,
            message: 'Guest teacher not found'
          });
        }
      }

      // Check for time conflicts
      const timeConflict = await this.checkTimeConflict(classScheduleData);
      if (timeConflict) {
        return res.status(400).json({
          success: false,
          message: timeConflict
        });
      }

      // Create the class schedule
      const newClassSchedule = await ClassSchedule.create(classScheduleData);

      // Fetch complete class schedule data with associations
      const completeClassSchedule = await ClassSchedule.findByPk(newClassSchedule.id, {
        include: [
          { 
            model: Subject, 
            as: 'subject',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          },
          { 
            model: Teacher, 
            as: 'teacher',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name', 'email']
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
              }
            ]
          },
          {
            model: User,
            as: 'creator',
            attributes: ['name', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Class schedule created successfully',
        data: { class: completeClassSchedule }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update class schedule
  async updateClassSchedule(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      updateData.updatedBy = req.user.id;

      const classSchedule = await ClassSchedule.findByPk(id);
      if (!classSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Class schedule not found'
        });
      }

      // Validate teacher assignment if being changed
      const newTeacherId = updateData.teacherId !== undefined ? updateData.teacherId : classSchedule.teacherId;
      const newGuestTeacherId = updateData.guestTeacherId !== undefined ? updateData.guestTeacherId : classSchedule.guestTeacherId;

      if (newTeacherId && newGuestTeacherId) {
        return res.status(400).json({
          success: false,
          message: 'Class schedule cannot have both a teacher and a guest teacher at the same time'
        });
      }

      // Ensure at least one teacher is assigned after update
      if (!newTeacherId && !newGuestTeacherId) {
        return res.status(400).json({
          success: false,
          message: 'Either a teacher or guest teacher must be assigned to the class schedule'
        });
      }

      // Check if subject exists (if being updated)
      if (updateData.subjectId) {
        const subject = await Subject.findByPk(updateData.subjectId);
        if (!subject) {
          return res.status(400).json({
            success: false,
            message: 'Subject not found'
          });
        }
      }

      // Check if teacher exists (if being updated)
      if (newTeacherId && newTeacherId !== classSchedule.teacherId) {
        const teacher = await Teacher.findByPk(newTeacherId);
        if (!teacher) {
          return res.status(400).json({
            success: false,
            message: 'Teacher not found'
          });
        }
      }

      // Check if guest teacher exists (if being updated)
      if (newGuestTeacherId && newGuestTeacherId !== classSchedule.guestTeacherId) {
        const guestTeacher = await GuestTeacher.findByPk(newGuestTeacherId);
        if (!guestTeacher) {
          return res.status(400).json({
            success: false,
            message: 'Guest teacher not found'
          });
        }
      }

      // Check for time conflicts (excluding current class schedule)
      const timeConflict = await this.checkTimeConflict(updateData, id);
      if (timeConflict) {
        return res.status(400).json({
          success: false,
          message: timeConflict
        });
      }

      // Update the class schedule
      await ClassSchedule.update(updateData, { where: { id } });

      // Fetch updated class schedule data
      const updatedClassSchedule = await ClassSchedule.findByPk(id, {
        include: [
          { 
            model: Subject, 
            as: 'subject',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          },
          { 
            model: Teacher, 
            as: 'teacher',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name', 'email']
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
              }
            ]
          },
          {
            model: User,
            as: 'creator',
            attributes: ['name', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['name', 'email']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Class schedule updated successfully',
        data: { class: updatedClassSchedule }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete class schedule
  async deleteClassSchedule(req, res, next) {
    try {
      const { id } = req.params;

      const classSchedule = await ClassSchedule.findByPk(id);
      if (!classSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Class schedule not found'
        });
      }

      // Check if class schedule has attendance records
      const attendanceCount = await Attendance.count({ where: { classScheduleId: id } });
      if (attendanceCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete class schedule. ${attendanceCount} attendance record(s) exist for this schedule.`
        });
      }

      // Delete the class schedule
      await ClassSchedule.destroy({ where: { id } });

      res.json({
        success: true,
        message: 'Class schedule deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get class schedules by teacher
  async getClassSchedulesByTeacher(req, res, next) {
    try {
      const { teacherId } = req.params;
      const { isActive = true, academicYear, semester } = req.query;

      const where = { teacherId };
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (academicYear) where.academicYear = academicYear;
      if (semester) where.semester = semester;

      const classSchedules = await ClassSchedule.findAll({
        where,
        include: [
          { 
            model: Subject, 
            as: 'subject',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          }
        ],
        order: [
          ['academicYear', 'DESC'],
          ['semester', 'ASC'],
          ['scheduleDay', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: { classes: classSchedules }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get class schedules by guest teacher
  async getClassSchedulesByGuestTeacher(req, res, next) {
    try {
      const { guestTeacherId } = req.params;
      const { isActive = true, academicYear, semester } = req.query;

      const where = { guestTeacherId };
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (academicYear) where.academicYear = academicYear;
      if (semester) where.semester = semester;

      const classSchedules = await ClassSchedule.findAll({
        where,
        include: [
          { 
            model: Subject, 
            as: 'subject',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          }
        ],
        order: [
          ['academicYear', 'DESC'],
          ['semester', 'ASC'],
          ['scheduleDay', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: { classes: classSchedules }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get class schedules by subject
  async getClassSchedulesBySubject(req, res, next) {
    try {
      const { subjectId } = req.params;
      const { isActive = true, academicYear, semester } = req.query;

      const where = { subjectId };
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (academicYear) where.academicYear = academicYear;
      if (semester) where.semester = semester;

      const classSchedules = await ClassSchedule.findAll({
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
              }
            ]
          }
        ],
        order: [
          ['academicYear', 'DESC'],
          ['semester', 'ASC'],
          ['scheduleDay', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: { classes: classSchedules }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get weekly schedule
  async getWeeklySchedule(req, res, next) {
    try {
      const { department, semester, academicYear } = req.query;

      const include = [
        { 
          model: Subject, 
          as: 'subject',
          include: [
            {
              model: Department,
              as: 'department'
            }
          ]
        },
        { 
          model: Teacher, 
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name']
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
              attributes: ['name']
            }
          ]
        }
      ];

      const where = { isActive: true };
      if (academicYear) where.academicYear = academicYear;
      if (semester) where.semester = semester;

      // Add filters
      if (department) {
        include[0].include[0].include[0].where = { id: department };
      }


      const classSchedules = await ClassSchedule.findAll({
        where,
        include,
        order: [
          ['scheduleDay', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      // Group class schedules by day
      const weeklySchedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };

      classSchedules.forEach(classSchedule => {
        weeklySchedule[classSchedule.scheduleDay].push(classSchedule);
      });

      res.json({
        success: true,
        data: { weeklySchedule }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get class schedules by room
  async getClassSchedulesByRoom(req, res, next) {
    try {
      const { roomNumber } = req.params;
      const { isActive = true, academicYear, semester } = req.query;

      const where = { roomNumber, isActive: isActive === 'true' };
      if (academicYear) where.academicYear = academicYear;
      if (semester) where.semester = semester;

      const classSchedules = await ClassSchedule.findAll({
        where,
        include: [
          { 
            model: Subject, 
            as: 'subject',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          },
          { 
            model: Teacher, 
            as: 'teacher',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name']
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
                attributes: ['name']
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
        data: { classes: classSchedules }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get class schedules by academic year and semester
  async getClassSchedulesByAcademicPeriod(req, res, next) {
    try {
      const { academicYear, semester } = req.params;
      const { isActive = true, department } = req.query;

      const where = { academicYear, semester, isActive: isActive === 'true' };

      const include = [
        { 
          model: Subject, 
          as: 'subject',
          include: [
            {
              model: Department,
              as: 'department'
            }
          ]
        },
        { 
          model: Teacher, 
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name']
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
              attributes: ['name']
            }
          ]
        }
      ];

      // Add filters
      if (department) {
        include[0].include[0].include[0].where = { id: department };
      }


      const classSchedules = await ClassSchedule.findAll({
        where,
        include,
        order: [
          ['scheduleDay', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: { classes: classSchedules }
      });
    } catch (error) {
      next(error);
    }
  }

  // Test endpoint to check if API is working
  async testEndpoint(req, res, next) {
    try {
      // Test if we can access the model
      const count = await ClassSchedule.count();
      const allSchedules = await ClassSchedule.findAll({
        limit: 5,
        attributes: ['id', 'subjectId', 'teacherId', 'scheduleDay', 'startTime', 'endTime', 'isActive']
      });
      
      // Test with raw query
      const { sequelize } = require('../config/database');
      const [rawResults] = await sequelize.query('SELECT * FROM class_schedules LIMIT 5');
      
      res.json({
        success: true,
        message: 'Class Schedule API is working',
        data: { 
          timestamp: new Date().toISOString(),
          endpoint: '/api/class-schedules/test',
          totalSchedules: count,
          sampleSchedules: allSchedules,
          rawQueryResults: rawResults,
          modelAccess: 'OK'
        }
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'Class Schedule API error',
        error: error.message,
        data: { 
          timestamp: new Date().toISOString(),
          endpoint: '/api/class-schedules/test'
        }
      });
    }
  }

  // Helper method to check for time conflicts
  async checkTimeConflict(classScheduleData, excludeId = null) {
    const baseWhere = {
      scheduleDay: classScheduleData.scheduleDay,
      isActive: true,
      [Op.or]: [
        {
          [Op.and]: [
            { startTime: { [Op.lte]: classScheduleData.startTime } },
            { endTime: { [Op.gt]: classScheduleData.startTime } }
          ]
        },
        {
          [Op.and]: [
            { startTime: { [Op.lt]: classScheduleData.endTime } },
            { endTime: { [Op.gte]: classScheduleData.endTime } }
          ]
        },
        {
          [Op.and]: [
            { startTime: { [Op.gte]: classScheduleData.startTime } },
            { endTime: { [Op.lte]: classScheduleData.endTime } }
          ]
        }
      ]
    };

    // Add academic year and semester filters if provided
    if (classScheduleData.academicYear) {
      baseWhere.academicYear = classScheduleData.academicYear;
    }
    if (classScheduleData.semester) {
      baseWhere.semester = classScheduleData.semester;
    }

    // Check teacher conflicts
    if (classScheduleData.teacherId) {
      const teacherWhere = { ...baseWhere, teacherId: classScheduleData.teacherId };
      const teacherConflict = await ClassSchedule.findOne({ where: teacherWhere });
      if (teacherConflict && teacherConflict.id !== excludeId) {
        return `Teacher has a conflicting class schedule at ${teacherConflict.startTime} - ${teacherConflict.endTime}`;
      }
    }

    // Check guest teacher conflicts
    if (classScheduleData.guestTeacherId) {
      const guestTeacherWhere = { ...baseWhere, guestTeacherId: classScheduleData.guestTeacherId };
      const guestTeacherConflict = await ClassSchedule.findOne({ where: guestTeacherWhere });
      if (guestTeacherConflict && guestTeacherConflict.id !== excludeId) {
        return `Guest teacher has a conflicting class schedule at ${guestTeacherConflict.startTime} - ${guestTeacherConflict.endTime}`;
      }
    }

    // Check room conflicts
    if (classScheduleData.roomNumber) {
      const roomWhere = { ...baseWhere, roomNumber: classScheduleData.roomNumber };
      const roomConflict = await ClassSchedule.findOne({ where: roomWhere });
      if (roomConflict && roomConflict.id !== excludeId) {
        return `Room ${classScheduleData.roomNumber} is already booked at ${roomConflict.startTime} - ${roomConflict.endTime}`;
      }
    }

    return null;
  }
}

const controller = new ClassScheduleController();

// Bind methods to preserve 'this' context
module.exports = {
  getAllClassSchedulesSimple: controller.getAllClassSchedulesSimple.bind(controller),
  getAllClassSchedules: controller.getAllClassSchedules.bind(controller),
  getClassScheduleById: controller.getClassScheduleById.bind(controller),
  createClassSchedule: controller.createClassSchedule.bind(controller),
  updateClassSchedule: controller.updateClassSchedule.bind(controller),
  deleteClassSchedule: controller.deleteClassSchedule.bind(controller),
  getClassSchedulesByTeacher: controller.getClassSchedulesByTeacher.bind(controller),
  getClassSchedulesByGuestTeacher: controller.getClassSchedulesByGuestTeacher.bind(controller),
  getClassSchedulesBySubject: controller.getClassSchedulesBySubject.bind(controller),
  getWeeklySchedule: controller.getWeeklySchedule.bind(controller),
  getClassSchedulesByRoom: controller.getClassSchedulesByRoom.bind(controller),
  getClassSchedulesByAcademicPeriod: controller.getClassSchedulesByAcademicPeriod.bind(controller),
  testEndpoint: controller.testEndpoint.bind(controller)
};
