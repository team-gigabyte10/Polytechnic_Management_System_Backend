const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { validate, departmentSchemas } = require('../middleware/validation');
const { authenticateToken, authorize } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.get('/:id/stats', departmentController.getDepartmentStats);

// Protected routes (authentication required)
router.use(authenticateToken);

// Debug route - check current user role (temporary)
router.get('/debug/user-info', (req, res) => {
  res.json({
    success: true,
    message: 'Current user information for Department API',
    data: {
      userId: req.user.userId,
      role: req.user.role,
      email: req.user.email,
      permissions: {
        canCreateDepartment: ['admin', 'teacher'].includes(req.user.role),
        canUpdateDepartment: ['admin', 'teacher'].includes(req.user.role),
        canDeleteDepartment: req.user.role === 'admin'
      }
    }
  });
});

// Admin and teacher only routes
router.post('/', 
  authorize(['admin', 'teacher']), 
  validate(departmentSchemas.create), 
  departmentController.createDepartment 
);

router.put('/:id', 
  authorize(['admin', 'teacher']), 
  validate(departmentSchemas.update), 
  departmentController.updateDepartment
);

router.delete('/:id', 
  authorize(['admin']), 
  departmentController.deleteDepartment
);

module.exports = router;
