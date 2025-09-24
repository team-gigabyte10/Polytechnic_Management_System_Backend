const { Subject, Department, ClassSchedule, Mark } = require('../models');
const { Op } = require('sequelize');

class SubjectController {
  // Get all subjects
  async getAllSubjects(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        semester, 
        department,
        search,
        credits 
      } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (semester) where.semester = semester;
      if (credits) where.credits = credits;

      // Add search functionality
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      const includeOptions = [
        { 
          model: Department, 
          as: 'department',
          attributes: ['name', 'code']
        }
      ];

      // Filter by department if specified
      if (department) where.departmentId = department;

      const { count, rows } = await Subject.findAndCountAll({
        where,
        include: includeOptions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['departmentId', 'ASC'],
          ['semester', 'ASC'],
          ['name', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: {
          subjects: rows,
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

  // Get subject by ID
  async getSubjectById(req, res, next) {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id, {
        include: [
          { 

            include: [
              {
                model: Department,
                as: 'department',
                attributes: ['name', 'code']
              }
            ]
          },
          {
            model: Class,
            as: 'classes',
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [
              {
                model: require('../models').Teacher,
                as: 'teacher',
                attributes: ['employeeId'],
                include: [
                  {
                    model: require('../models').User,
                    as: 'user',
                    attributes: ['name']
                  }
                ]
              },
              {
                model: require('../models').GuestTeacher,
                as: 'guestTeacher',
                attributes: ['employeeId'],
                include: [
                  {
                    model: require('../models').User,
                    as: 'user',
                    attributes: ['name']
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      res.json({
        success: true,
        data: { subject }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new subject
  async createSubject(req, res, next) {
    try {
      const subjectData = req.body;

      // Check if department exists
      const dept = await Department.findByPk(subjectData.departmentId);
      if (!dept) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }

      // Check if subject code already exists
      const existingSubject = await Subject.findOne({ 
        where: { code: subjectData.code } 
      });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this code already exists'
        });
      }

      // Check if subject name already exists in the same department and semester
      const existingSubjectName = await Subject.findOne({ 
        where: { 
          name: subjectData.name,
          departmentId: subjectData.departmentId,
          semester: subjectData.semester
        } 
      });
      if (existingSubjectName) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this name already exists in the same department and semester'
        });
      }

      // Create subject
      const subject = await Subject.create(subjectData);

      // Fetch complete subject data
      const completeSubject = await Subject.findByPk(subject.id, {
        include: [
          { 
            model: Department, 
            as: 'department',
            attributes: ['name', 'code']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: { subject: completeSubject }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update subject
  async updateSubject(req, res, next) {
    try {
      const { id } = req.params;
      const subjectData = req.body;

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      // Check if department exists (if being updated)
      if (subjectData.departmentId) {
        const dept = await Department.findByPk(subjectData.departmentId);
        if (!dept) {
          return res.status(400).json({
            success: false,
            message: 'Department not found'
          });
        }
      }

      // Check if subject code is being changed and if it already exists
      if (subjectData.code && subjectData.code !== subject.code) {
        const existingSubject = await Subject.findOne({ 
          where: { 
            code: subjectData.code,
            id: { [Op.ne]: id }
          } 
        });
        if (existingSubject) {
          return res.status(400).json({ 
            success: false, 
            message: 'Subject code already exists' 
          });
        }
      }

      // Check if subject name is being changed and if it already exists in the same department and semester
      if (subjectData.name && subjectData.name !== subject.name) {
        const departmentId = subjectData.departmentId || subject.departmentId;
        const semester = subjectData.semester || subject.semester;
        
        const existingSubjectName = await Subject.findOne({ 
          where: { 
            name: subjectData.name,
            departmentId: departmentId,
            semester: semester,
            id: { [Op.ne]: id }
          } 
        });
        if (existingSubjectName) {
          return res.status(400).json({ 
            success: false, 
            message: 'Subject name already exists in the same department and semester' 
          });
        }
      }

      // Update subject
      await Subject.update(subjectData, { where: { id } });

      // Fetch updated subject data
      const updatedSubject = await Subject.findByPk(id, {
        include: [
          { 
            model: Department, 
            as: 'department',
            attributes: ['name', 'code']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Subject updated successfully',
        data: { subject: updatedSubject }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete subject
  async deleteSubject(req, res, next) {
    try {
      const { id } = req.params;
      const { force = false } = req.query;

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      // If not force delete, check for dependencies
      if (!force) {
        // Check if subject has class schedules
        const classScheduleCount = await ClassSchedule.count({ where: { subjectId: id } });
        if (classScheduleCount > 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete subject. ${classScheduleCount} class schedule(s) are assigned to this subject. Use ?force=true to force delete.`
          });
        }

        // Check if subject has marks
        const markCount = await Mark.count({ where: { subjectId: id } });
        if (markCount > 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete subject. ${markCount} mark record(s) exist for this subject. Use ?force=true to force delete.`
          });
        }
      }

      // Delete subject
      await Subject.destroy({ where: { id } });

      res.json({
        success: true,
        message: 'Subject deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subjects by department
  async getSubjectsByDepartment(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { semester } = req.query;

      const where = { departmentId };
      if (semester) where.semester = semester;

      const subjects = await Subject.findAll({
        where,
        include: [
          { 
            model: Department, 
            as: 'department',
            attributes: ['name', 'code']
          }
        ],
        order: [
          ['semester', 'ASC'],
          ['name', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: { subjects }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subjects by semester
  async getSubjectsBySemester(req, res, next) {
    try {
      const { semester } = req.params;
      const { departmentId } = req.query;

      const where = { semester };
      if (departmentId) where.departmentId = departmentId;

      const subjects = await Subject.findAll({
        where,
        include: [
          { 
            model: Department, 
            as: 'department',
            attributes: ['name', 'code']
          }
        ],
        order: [
          ['departmentId', 'ASC'],
          ['name', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: { subjects }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subject statistics
  async getSubjectStats(req, res, next) {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      // Get class schedule count
      const classScheduleCount = await ClassSchedule.count({ where: { subjectId: id } });

      // Get mark count
      const markCount = await Mark.count({ where: { subjectId: id } });

      // Get active class schedules count
      const activeClassScheduleCount = await ClassSchedule.count({ 
        where: { 
          subjectId: id, 
          isActive: true 
        } 
      });

      // Get total students enrolled (from class schedules)
      const totalStudentsResult = await ClassSchedule.findAll({
        where: { subjectId: id },
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalClasses']
        ]
      });

      res.json({
        success: true,
        data: {
          subject: {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            credits: subject.credits,
            theoryHours: subject.theoryHours,
            practicalHours: subject.practicalHours
          },
          statistics: {
            totalClassSchedules: classScheduleCount,
            activeClassSchedules: activeClassScheduleCount,
            totalMarks: markCount,
            totalHours: subject.theoryHours + subject.practicalHours
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

const controller = new SubjectController();

// Bind methods to preserve 'this' context
module.exports = {
  getAllSubjects: controller.getAllSubjects.bind(controller),
  getSubjectById: controller.getSubjectById.bind(controller),
  createSubject: controller.createSubject.bind(controller),
  updateSubject: controller.updateSubject.bind(controller),
  deleteSubject: controller.deleteSubject.bind(controller),
  getSubjectsByDepartment: controller.getSubjectsByDepartment.bind(controller),
  getSubjectsBySemester: controller.getSubjectsBySemester.bind(controller),
  getSubjectStats: controller.getSubjectStats.bind(controller)
};
