const { Department, Teacher, Student } = require('../models');
const { Op } = require('sequelize');

class DepartmentController {
  // Get all departments
  async getAllDepartments(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Department.findAndCountAll({
        where,
        include: [
          { 
            model: Teacher, 
            as: 'head', 
            attributes: ['id', 'employeeId'],
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['name', 'email']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          departments: rows,
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

  // Get department by ID
  async getDepartmentById(req, res, next) {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id, {
        include: [
          { 
            model: Teacher, 
            as: 'head',
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['name', 'email', 'isActive']
              }
            ]
          },
          { 

            attributes: ['id', 'name', 'code', 'durationYears']
          },
          { 
            model: Student, 
            as: 'students',
            attributes: ['id', 'rollNumber', 'semester'],
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['name', 'email', 'isActive']
              }
            ]
          },
          { 
            model: Teacher, 
            as: 'teachers',
            attributes: ['id', 'employeeId', 'qualification'],
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['name', 'email', 'isActive']
              }
            ]
          }
        ]
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      res.json({
        success: true,
        data: department
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new department
  async createDepartment(req, res, next) {
    try {
      const { name, code, headId } = req.body;

      // Check if department name already exists
      const existingName = await Department.findOne({
        where: { name }
      });

      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Department name already exists'
        });
      }

      // Check if department code already exists
      const existingCode = await Department.findOne({
        where: { code }
      });

      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Department code already exists'
        });
      }

      // Check if head teacher exists (if headId is provided)
      if (headId) {
        const headTeacher = await Teacher.findByPk(headId);
        if (!headTeacher) {
          return res.status(400).json({
            success: false,
            message: 'Head teacher not found'
          });
        }
      }

      const department = await Department.create({
        name,
        code,
        headId: headId || null
      });

      // Fetch the created department with head info
      const createdDepartment = await Department.findByPk(department.id, {
        include: [
          { 
            model: Teacher, 
            as: 'head',
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['name', 'email']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: createdDepartment
      });
    } catch (error) {
      next(error);
    }
  }

  // Update department
  async updateDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const { name, code, headId } = req.body;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      // Check if department name already exists (excluding current department)
      if (name && name !== department.name) {
        const existingName = await Department.findOne({
          where: { 
            name,
            id: { [Op.ne]: id }
          }
        });

        if (existingName) {
          return res.status(400).json({
            success: false,
            message: 'Department name already exists'
          });
        }
      }

      // Check if department code already exists (excluding current department)
      if (code && code !== department.code) {
        const existingCode = await Department.findOne({
          where: { 
            code,
            id: { [Op.ne]: id }
          }
        });

        if (existingCode) {
          return res.status(400).json({
            success: false,
            message: 'Department code already exists'
          });
        }
      }

      // Check if head teacher exists (if headId is being updated)
      if (headId && headId !== department.headId) {
        if (headId !== null) {
          const headTeacher = await Teacher.findByPk(headId);
          if (!headTeacher) {
            return res.status(400).json({
              success: false,
              message: 'Head teacher not found'
            });
          }
        }
      }

      // Update department
      await department.update({
        name: name || department.name,
        code: code || department.code,
        headId: headId !== undefined ? headId : department.headId
      });

      // Fetch the updated department with head info
      const updatedDepartment = await Department.findByPk(id, {
        include: [
          { 
            model: Teacher, 
            as: 'head',
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['name', 'email']
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Department updated successfully',
        data: updatedDepartment
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete department
  async deleteDepartment(req, res, next) {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }



      // Check if department has students
      const studentCount = await Student.count({
        where: { departmentId: id }
      });

      if (studentCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete department. ${studentCount} student(s) are enrolled in this department.`
        });
      }

      // Check if department has teachers
      const teacherCount = await Teacher.count({
        where: { departmentId: id }
      });

      if (teacherCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete department. ${teacherCount} teacher(s) are assigned to this department.`
        });
      }

      await department.destroy();

      res.json({
        success: true,
        message: 'Department deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get department statistics
  async getDepartmentStats(req, res, next) {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      // Get counts

      const studentCount = await Student.count({ where: { departmentId: id } });
      const teacherCount = await Teacher.count({ where: { departmentId: id } });

      res.json({
        success: true,
        data: {
          department: {
            id: department.id,
            name: department.name,
            code: department.code
          },
          statistics: {

            students: studentCount,
            teachers: teacherCount
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

const controller = new DepartmentController();

// Bind methods to preserve 'this' context
module.exports = {
  getAllDepartments: controller.getAllDepartments.bind(controller),
  getDepartmentById: controller.getDepartmentById.bind(controller),
  createDepartment: controller.createDepartment.bind(controller),
  updateDepartment: controller.updateDepartment.bind(controller),
  deleteDepartment: controller.deleteDepartment.bind(controller),
  getDepartmentStats: controller.getDepartmentStats.bind(controller)
};
