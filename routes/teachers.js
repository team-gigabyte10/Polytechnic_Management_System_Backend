const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, teacherSchemas } = require('../middleware/validation');

// Protect all teacher routes
router.use(authenticateToken);

// Get all teachers - Admin can view; teachers can view list too
router.get('/', authorize(['admin', 'teacher']), teacherController.getAllTeachers);

// Get teacher by ID - Admin and the teacher themselves can view
router.get('/:id', teacherController.getTeacherById);

// Create new teacher - Only admin can create
router.post('/', 
  authorize(['admin']), 
  validate(teacherSchemas.create), 
  teacherController.createTeacher
);

// Update teacher - Admin and the teacher themselves can update
router.put('/:id', 
  authorize(['admin', 'teacher']), 
  validate(teacherSchemas.update), 
  teacherController.updateTeacher
);

// Delete teacher - Only admin can delete
router.delete('/:id', 
  authorize(['admin']), 
  teacherController.deleteTeacher
);

module.exports = router;
