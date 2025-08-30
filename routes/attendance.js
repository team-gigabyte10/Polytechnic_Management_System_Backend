const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeTeacherOrAdmin } = require('../middleware/auth');
const { validate, attendanceSchemas } = require('../middleware/validation');

// Protect all attendance routes
router.use(authenticateToken);

// Mark attendance - Teachers and admin can mark
router.post('/mark', 
  authorizeTeacherOrAdmin,
  validate(attendanceSchemas.markAttendance), 
  attendanceController.markAttendance
);

// Get class attendance for specific date - Teachers and admin can view
router.get('/class/:classId', 
  authorizeTeacherOrAdmin,
  attendanceController.getClassAttendance
);

// Get student attendance report - All authenticated users can view
router.get('/student/:studentId/report', attendanceController.getStudentAttendanceReport);

// Get class attendance summary - Teachers and admin can view
router.get('/class/:classId/summary', 
  authorizeTeacherOrAdmin,
  attendanceController.getClassAttendanceSummary
);

// Get attendance rewards and fines
router.get('/rewards-fines', attendanceController.getAttendanceRewardsAndFines);

module.exports = router;