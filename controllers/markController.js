const { Mark, Student, Subject, User, Department } = require('../models');
const { Op } = require('sequelize');

class MarkController {
  // Get all marks with filtering and pagination
  async getAllMarks(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        studentId, 
        subjectId, 
        examType, 
        semester,
        departmentId,
        startDate,
        endDate,
        grade
      } = req.query;
      
      const offset = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (studentId) where.studentId = studentId;
      if (subjectId) where.subjectId = subjectId;
      if (examType) where.examType = examType;
      if (grade) where.grade = grade;
      
      if (startDate && endDate) {
        where.examDate = {
          [Op.between]: [startDate, endDate]
        };
      }

      // Build include conditions for student and subject filtering
      const studentInclude = {
        model: Student,
        as: 'student',
        include: [
          { model: User, as: 'user', attributes: ['name', 'email'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] }
        ]
      };

      const subjectInclude = {
        model: Subject,
        as: 'subject',
        include: [
          { model: Department, as: 'department', attributes: ['name', 'code'] }
        ]
      };

      // Apply semester and department filters through includes
      if (semester) {
        studentInclude.where = { semester };
      }
      
      if (departmentId) {
        studentInclude.include[1].where = { id: departmentId };
      }

      const { count, rows } = await Mark.findAndCountAll({
        where,
        include: [
          studentInclude,
          subjectInclude,
          { model: User, as: 'creator', attributes: ['name', 'email'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['examDate', 'DESC'], ['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          marks: rows,
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

  // Get mark by ID
  async getMarkById(req, res, next) {
    try {
      const { id } = req.params;

      const mark = await Mark.findByPk(id, {
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              { model: User, as: 'user', attributes: ['name', 'email'] },
              { model: Department, as: 'department', attributes: ['name', 'code'] }
            ]
          },
          {
            model: Subject,
            as: 'subject',
            include: [
              { model: Department, as: 'department', attributes: ['name', 'code'] }
            ]
          },
          { model: User, as: 'creator', attributes: ['name', 'email'] }
        ]
      });

      if (!mark) {
        return res.status(404).json({
          success: false,
          message: 'Mark not found'
        });
      }

      res.json({
        success: true,
        data: { mark }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new mark
  async createMark(req, res, next) {
    try {
      const { subjectId, studentId, examType, totalMarks, obtainedMarks, examDate, grade } = req.body;

      // Validate that student exists
      const student = await Student.findByPk(studentId, {
        include: [{ model: Subject, as: 'marks', where: { subjectId } }]
      });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Validate that subject exists
      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      // Check if student is enrolled in the subject (same department and semester)
      if (student.departmentId !== subject.departmentId || student.semester !== subject.semester) {
        return res.status(400).json({
          success: false,
          message: 'Student is not enrolled in this subject'
        });
      }

      // Check for duplicate marks (same student, subject, exam type, and date)
      const existingMark = await Mark.findOne({
        where: {
          studentId,
          subjectId,
          examType,
          examDate: examDate || new Date().toISOString().split('T')[0]
        }
      });

      if (existingMark) {
        return res.status(400).json({
          success: false,
          message: 'Mark already exists for this student, subject, exam type, and date'
        });
      }

      // Validate obtained marks don't exceed total marks
      if (obtainedMarks > totalMarks) {
        return res.status(400).json({
          success: false,
          message: 'Obtained marks cannot exceed total marks'
        });
      }

      // Calculate grade if not provided
      let calculatedGrade = grade;
      if (!grade) {
        calculatedGrade = this.calculateGrade(obtainedMarks, totalMarks);
      }

      const mark = await Mark.create({
        subjectId,
        studentId,
        examType,
        totalMarks,
        obtainedMarks,
        grade: calculatedGrade,
        examDate: examDate || new Date().toISOString().split('T')[0],
        createdBy: req.user.userId
      });

      // Fetch complete mark data
      const completeMark = await Mark.findByPk(mark.id, {
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              { model: User, as: 'user', attributes: ['name', 'email'] },
              { model: Department, as: 'department', attributes: ['name', 'code'] }
            ]
          },
          {
            model: Subject,
            as: 'subject',
            include: [
              { model: Department, as: 'department', attributes: ['name', 'code'] }
            ]
          },
          { model: User, as: 'creator', attributes: ['name', 'email'] }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Mark created successfully',
        data: { mark: completeMark }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update mark
  async updateMark(req, res, next) {
    try {
      const { id } = req.params;
      const { subjectId, studentId, examType, totalMarks, obtainedMarks, examDate, grade } = req.body;

      const mark = await Mark.findByPk(id);
      if (!mark) {
        return res.status(404).json({
          success: false,
          message: 'Mark not found'
        });
      }

      // Check if user has permission to update (admin, teacher who created it, or student themselves)
      const isAdmin = req.user.role === 'admin';
      const isTeacher = req.user.role === 'teacher';
      const isCreator = mark.createdBy === req.user.userId;
      const isStudent = req.user.role === 'student' && studentId && req.user.userId === studentId;

      if (!isAdmin && !isCreator && !isStudent) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this mark'
        });
      }

      // Validate obtained marks don't exceed total marks
      if (obtainedMarks && totalMarks && obtainedMarks > totalMarks) {
        return res.status(400).json({
          success: false,
          message: 'Obtained marks cannot exceed total marks'
        });
      }

      // Calculate grade if not provided and marks are being updated
      let calculatedGrade = grade;
      if (!grade && obtainedMarks !== undefined && totalMarks !== undefined) {
        calculatedGrade = this.calculateGrade(obtainedMarks, totalMarks);
      }

      const updateData = {
        ...(subjectId && { subjectId }),
        ...(studentId && { studentId }),
        ...(examType && { examType }),
        ...(totalMarks !== undefined && { totalMarks }),
        ...(obtainedMarks !== undefined && { obtainedMarks }),
        ...(examDate && { examDate }),
        ...(calculatedGrade && { grade: calculatedGrade })
      };

      await Mark.update(updateData, { where: { id } });

      // Fetch updated mark data
      const updatedMark = await Mark.findByPk(id, {
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              { model: User, as: 'user', attributes: ['name', 'email'] },
              { model: Department, as: 'department', attributes: ['name', 'code'] }
            ]
          },
          {
            model: Subject,
            as: 'subject',
            include: [
              { model: Department, as: 'department', attributes: ['name', 'code'] }
            ]
          },
          { model: User, as: 'creator', attributes: ['name', 'email'] }
        ]
      });

      res.json({
        success: true,
        message: 'Mark updated successfully',
        data: { mark: updatedMark }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete mark
  async deleteMark(req, res, next) {
    try {
      const { id } = req.params;

      const mark = await Mark.findByPk(id);
      if (!mark) {
        return res.status(404).json({
          success: false,
          message: 'Mark not found'
        });
      }

      // Check if user has permission to delete (admin or teacher who created it)
      const isAdmin = req.user.role === 'admin';
      const isCreator = mark.createdBy === req.user.userId;

      if (!isAdmin && !isCreator) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this mark'
        });
      }

      await Mark.destroy({ where: { id } });

      res.json({
        success: true,
        message: 'Mark deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get marks for a specific student
  async getStudentMarks(req, res, next) {
    try {
      const { studentId } = req.params;
      const { subjectId, examType, semester, academicYear } = req.query;

      // Check if student exists
      const student = await Student.findByPk(studentId, {
        include: [
          { model: User, as: 'user', attributes: ['name', 'email'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const where = { studentId };
      if (subjectId) where.subjectId = subjectId;
      if (examType) where.examType = examType;

      const marks = await Mark.findAll({
        where,
        include: [
          {
            model: Subject,
            as: 'subject',
            include: [
              { model: Department, as: 'department', attributes: ['name', 'code'] }
            ]
          },
          { model: User, as: 'creator', attributes: ['name', 'email'] }
        ],
        order: [['examDate', 'DESC'], ['createdAt', 'DESC']]
      });

      // Filter by semester and academic year if provided
      let filteredMarks = marks;
      if (semester) {
        filteredMarks = marks.filter(mark => mark.subject.semester === parseInt(semester));
      }

      // Calculate statistics
      const statistics = this.calculateStudentStatistics(marks);

      res.json({
        success: true,
        data: {
          student,
          marks: filteredMarks,
          statistics
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get marks for a specific subject
  async getSubjectMarks(req, res, next) {
    try {
      const { subjectId } = req.params;
      const { examType, semester, academicYear } = req.query;

      // Check if subject exists
      const subject = await Subject.findByPk(subjectId, {
        include: [
          { model: Department, as: 'department', attributes: ['name', 'code'] }
        ]
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      const where = { subjectId };
      if (examType) where.examType = examType;

      const marks = await Mark.findAll({
        where,
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              { model: User, as: 'user', attributes: ['name', 'email'] },
              { model: Department, as: 'department', attributes: ['name', 'code'] }
            ]
          },
          { model: User, as: 'creator', attributes: ['name', 'email'] }
        ],
        order: [['examDate', 'DESC'], ['createdAt', 'DESC']]
      });

      // Calculate statistics
      const statistics = this.calculateSubjectStatistics(marks);

      res.json({
        success: true,
        data: {
          subject,
          marks,
          statistics
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk create marks
  async bulkCreateMarks(req, res, next) {
    try {
      const { marks } = req.body;

      if (!Array.isArray(marks) || marks.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Marks array is required and cannot be empty'
        });
      }

      const results = {
        successful: [],
        failed: []
      };

      for (const markData of marks) {
        try {
          const { subjectId, studentId, examType, totalMarks, obtainedMarks, examDate, grade } = markData;

          // Validate required fields
          if (!subjectId || !studentId || !examType || !totalMarks || obtainedMarks === undefined) {
            results.failed.push({
              data: markData,
              error: 'Missing required fields'
            });
            continue;
          }

          // Validate that student exists
          const student = await Student.findByPk(studentId);
          if (!student) {
            results.failed.push({
              data: markData,
              error: 'Student not found'
            });
            continue;
          }

          // Validate that subject exists
          const subject = await Subject.findByPk(subjectId);
          if (!subject) {
            results.failed.push({
              data: markData,
              error: 'Subject not found'
            });
            continue;
          }

          // Check for duplicate marks
          const existingMark = await Mark.findOne({
            where: {
              studentId,
              subjectId,
              examType,
              examDate: examDate || new Date().toISOString().split('T')[0]
            }
          });

          if (existingMark) {
            results.failed.push({
              data: markData,
              error: 'Mark already exists for this student, subject, exam type, and date'
            });
            continue;
          }

          // Validate obtained marks don't exceed total marks
          if (obtainedMarks > totalMarks) {
            results.failed.push({
              data: markData,
              error: 'Obtained marks cannot exceed total marks'
            });
            continue;
          }

          // Calculate grade if not provided
          const calculatedGrade = grade || this.calculateGrade(obtainedMarks, totalMarks);

          const mark = await Mark.create({
            subjectId,
            studentId,
            examType,
            totalMarks,
            obtainedMarks,
            grade: calculatedGrade,
            examDate: examDate || new Date().toISOString().split('T')[0],
            createdBy: req.user.userId
          });

          results.successful.push(mark);
        } catch (error) {
          results.failed.push({
            data: markData,
            error: error.message
          });
        }
      }

      res.status(201).json({
        success: true,
        message: `Bulk mark creation completed. ${results.successful.length} successful, ${results.failed.length} failed`,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // Get mark statistics
  async getMarkStatistics(req, res, next) {
    try {
      const { departmentId, semester, examType, startDate, endDate } = req.query;

      const where = {};
      if (examType) where.examType = examType;
      if (startDate && endDate) {
        where.examDate = {
          [Op.between]: [startDate, endDate]
        };
      }

      const marks = await Mark.findAll({
        where,
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              { model: Department, as: 'department' }
            ]
          },
          { model: Subject, as: 'subject' }
        ]
      });

      // Filter by department and semester if provided
      let filteredMarks = marks;
      if (departmentId) {
        filteredMarks = marks.filter(mark => mark.student.department.id === parseInt(departmentId));
      }
      if (semester) {
        filteredMarks = filteredMarks.filter(mark => mark.student.semester === parseInt(semester));
      }

      const statistics = this.calculateOverallStatistics(filteredMarks);

      res.json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper method to calculate grade
  calculateGrade(obtainedMarks, totalMarks) {
    const percentage = (obtainedMarks / totalMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  }

  // Helper method to calculate student statistics
  calculateStudentStatistics(marks) {
    if (marks.length === 0) {
      return {
        totalMarks: 0,
        averagePercentage: 0,
        gradeDistribution: {},
        examTypeDistribution: {}
      };
    }

    const totalMarks = marks.length;
    const totalObtained = marks.reduce((sum, mark) => sum + parseFloat(mark.obtainedMarks), 0);
    const totalPossible = marks.reduce((sum, mark) => sum + parseFloat(mark.totalMarks), 0);
    const averagePercentage = totalPossible > 0 ? (totalObtained / totalPossible * 100).toFixed(2) : 0;

    const gradeDistribution = marks.reduce((acc, mark) => {
      acc[mark.grade] = (acc[mark.grade] || 0) + 1;
      return acc;
    }, {});

    const examTypeDistribution = marks.reduce((acc, mark) => {
      acc[mark.examType] = (acc[mark.examType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalMarks,
      averagePercentage: parseFloat(averagePercentage),
      gradeDistribution,
      examTypeDistribution
    };
  }

  // Helper method to calculate subject statistics
  calculateSubjectStatistics(marks) {
    if (marks.length === 0) {
      return {
        totalStudents: 0,
        averagePercentage: 0,
        passRate: 0,
        gradeDistribution: {}
      };
    }

    const totalStudents = marks.length;
    const totalObtained = marks.reduce((sum, mark) => sum + parseFloat(mark.obtainedMarks), 0);
    const totalPossible = marks.reduce((sum, mark) => sum + parseFloat(mark.totalMarks), 0);
    const averagePercentage = totalPossible > 0 ? (totalObtained / totalPossible * 100).toFixed(2) : 0;

    const passedStudents = marks.filter(mark => {
      const percentage = (mark.obtainedMarks / mark.totalMarks) * 100;
      return percentage >= 33; // Passing grade
    }).length;

    const passRate = (passedStudents / totalStudents * 100).toFixed(2);

    const gradeDistribution = marks.reduce((acc, mark) => {
      acc[mark.grade] = (acc[mark.grade] || 0) + 1;
      return acc;
    }, {});

    return {
      totalStudents,
      averagePercentage: parseFloat(averagePercentage),
      passRate: parseFloat(passRate),
      gradeDistribution
    };
  }

  // Helper method to calculate overall statistics
  calculateOverallStatistics(marks) {
    if (marks.length === 0) {
      return {
        totalMarks: 0,
        averagePercentage: 0,
        passRate: 0,
        gradeDistribution: {},
        examTypeDistribution: {},
        departmentDistribution: {},
        semesterDistribution: {}
      };
    }

    const totalMarks = marks.length;
    const totalObtained = marks.reduce((sum, mark) => sum + parseFloat(mark.obtainedMarks), 0);
    const totalPossible = marks.reduce((sum, mark) => sum + parseFloat(mark.totalMarks), 0);
    const averagePercentage = totalPossible > 0 ? (totalObtained / totalPossible * 100).toFixed(2) : 0;

    const passedMarks = marks.filter(mark => {
      const percentage = (mark.obtainedMarks / mark.totalMarks) * 100;
      return percentage >= 33;
    }).length;

    const passRate = (passedMarks / totalMarks * 100).toFixed(2);

    const gradeDistribution = marks.reduce((acc, mark) => {
      acc[mark.grade] = (acc[mark.grade] || 0) + 1;
      return acc;
    }, {});

    const examTypeDistribution = marks.reduce((acc, mark) => {
      acc[mark.examType] = (acc[mark.examType] || 0) + 1;
      return acc;
    }, {});

    const departmentDistribution = marks.reduce((acc, mark) => {
      const deptName = mark.student.department.name;
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    const semesterDistribution = marks.reduce((acc, mark) => {
      const semester = mark.student.semester;
      acc[semester] = (acc[semester] || 0) + 1;
      return acc;
    }, {});

    return {
      totalMarks,
      averagePercentage: parseFloat(averagePercentage),
      passRate: parseFloat(passRate),
      gradeDistribution,
      examTypeDistribution,
      departmentDistribution,
      semesterDistribution
    };
  }
}

const controller = new MarkController();

// Bind methods to preserve 'this' context
module.exports = {
  getAllMarks: controller.getAllMarks.bind(controller),
  getMarkById: controller.getMarkById.bind(controller),
  createMark: controller.createMark.bind(controller),
  updateMark: controller.updateMark.bind(controller),
  deleteMark: controller.deleteMark.bind(controller),
  getStudentMarks: controller.getStudentMarks.bind(controller),
  getSubjectMarks: controller.getSubjectMarks.bind(controller),
  bulkCreateMarks: controller.bulkCreateMarks.bind(controller),
  getMarkStatistics: controller.getMarkStatistics.bind(controller)
};
