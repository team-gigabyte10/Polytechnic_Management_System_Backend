const { Op } = require('sequelize');
const { User, Student, Teacher, GuestTeacher, Department } = require('../models');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role, isActive, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (role) where.role = role;
      if (typeof isActive !== 'undefined') where.isActive = isActive === 'true' || isActive === true;
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        include: [
          { 
            association: 'studentProfile',
            attributes: ['id', 'rollNumber', 'departmentId', 'semester'],
            include: [
              { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },

            ]
          },
          { 
            association: 'teacherProfile',
            attributes: ['id', 'employeeId', 'departmentId', 'designation'],
            include: [
              { model: Department, as: 'department', attributes: ['id', 'name', 'code'] }
            ]
          },
          { 
            association: 'guestTeacherProfile',
            attributes: ['id', 'employeeId', 'departmentId', 'paymentType'],
            include: [
              { model: Department, as: 'department', attributes: ['id', 'name', 'code'] }
            ]
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['id', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          users: rows,
          pagination: {
            total: count,
            pages: Math.ceil(count / parseInt(limit)),
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

module.exports = new UserController();
