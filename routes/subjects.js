const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, subjectSchemas } = require('../middleware/validation');

// Protect all subject routes
router.use(authenticateToken);

// Get all subjects - Admin, teachers, and students can view
router.get('/', authorize(['admin', 'teacher', 'student']), subjectController.getAllSubjects);

// Get subject by ID - Admin, teachers, and students can view
router.get('/:id', authorize(['admin', 'teacher', 'student']), subjectController.getSubjectById);

// Create new subject - Only admin can create
router.post('/', 
  authorize(['admin']), 
  validate(subjectSchemas.create), 
  subjectController.createSubject
);

// Update subject - Only admin can update
router.put('/:id', 
  authorize(['admin']), 
  validate(subjectSchemas.update), 
  subjectController.updateSubject
);

// Delete subject - Only admin can delete
router.delete('/:id', 
  authorize(['admin']), 
  subjectController.deleteSubject
);

// Get subjects by department - Admin, teachers, and students can view
router.get('/department/:departmentId', 
  authorize(['admin', 'teacher', 'student']), 
  subjectController.getSubjectsByDepartment
);

// Get subjects by semester - Admin, teachers, and students can view
router.get('/semester/:semester', 
  authorize(['admin', 'teacher', 'student']), 
  subjectController.getSubjectsBySemester
);

// Get subject statistics - Admin and teachers can view
router.get('/:id/stats', 
  authorize(['admin', 'teacher']), 
  subjectController.getSubjectStats
);

module.exports = router;
