const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, markSchemas } = require('../middleware/validation');

// Protect all mark routes
router.use(authenticateToken);

// Get all marks with filtering and pagination - Admin and teachers can view
router.get('/', authorize(['admin', 'teacher']), markController.getAllMarks);

// Get mark by ID - Admin, teachers, and students can view
router.get('/:id', markController.getMarkById);

// Create new mark - Admin and teachers can create
router.post('/', 
  authorize(['admin', 'teacher']), 
  validate(markSchemas.create), 
  markController.createMark
);

// Update mark - Admin and teachers can update
router.put('/:id', 
  authorize(['admin', 'teacher']), 
  validate(markSchemas.update), 
  markController.updateMark
);

// Delete mark - Admin and teachers can delete
router.delete('/:id', 
  authorize(['admin', 'teacher']), 
  markController.deleteMark
);

// Get marks for a specific student - Admin, teachers, and the student themselves
router.get('/student/:studentId', markController.getStudentMarks);

// Get marks for a specific subject - Admin and teachers can view
router.get('/subject/:subjectId', 
  authorize(['admin', 'teacher']), 
  markController.getSubjectMarks
);

// Bulk create marks - Admin and teachers can create
router.post('/bulk', 
  authorize(['admin', 'teacher']), 
  validate(markSchemas.bulkCreate), 
  markController.bulkCreateMarks
);

// Get mark statistics - Admin and teachers can view
router.get('/statistics/overview', 
  authorize(['admin', 'teacher']), 
  markController.getMarkStatistics
);

module.exports = router;
