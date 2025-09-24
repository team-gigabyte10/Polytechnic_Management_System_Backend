const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, studentSchemas } = require('../middleware/validation');

// Protect all student routes
router.use(authenticateToken);

// Get all students - Admin and teachers can view
router.get('/', authorize(['admin', 'teacher']), studentController.getAllStudents);

// Get student by ID - Admin, teachers, and the student themselves can view
router.get('/:id', studentController.getStudentById);

// Create new student - Only admin can create
router.post('/', 
  authorize(['admin']), 
  validate(studentSchemas.create), 
  studentController.createStudent
);

// Update student - Admin and the student themselves can update
router.put('/:id', 
  authorize(['admin', 'student']), 
  validate(studentSchemas.update), 
  studentController.updateStudent
);

// Delete student - Only admin can delete
router.delete('/:id', 
  authorize(['admin']), 
  studentController.deleteStudent
);

// Get attendance summary for a student
router.get('/:id/attendance-summary', studentController.getAttendanceSummary);

// Get payment history for a student
router.get('/:id/payment-history', studentController.getPaymentHistory);

module.exports = router;