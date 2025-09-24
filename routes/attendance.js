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

// Get class schedule attendance for specific date - Teachers and admin can view
router.get('/class-schedule/:classScheduleId', 
  authorizeTeacherOrAdmin,
  attendanceController.getClassScheduleAttendance
);

// Alternative route for frontend compatibility - Get class attendance for specific date
router.get('/class/:classScheduleId', 
  authorizeTeacherOrAdmin,
  attendanceController.getClassScheduleAttendance
);

// Get student attendance report - All authenticated users can view
router.get('/student/:studentId/report', attendanceController.getStudentAttendanceReport);

// Get class schedule attendance summary - Teachers and admin can view
router.get('/class-schedule/:classScheduleId/summary', 
  authorizeTeacherOrAdmin,
  attendanceController.getClassScheduleAttendanceSummary
);

// Alternative route for frontend compatibility - Get class attendance summary
router.get('/class/:classScheduleId/summary', 
  authorizeTeacherOrAdmin,
  attendanceController.getClassScheduleAttendanceSummary
);

// Get attendance rewards and fines
router.get('/rewards-fines', attendanceController.getAttendanceRewardsAndFines);

// Get attendance statistics for dashboard
router.get('/statistics', attendanceController.getAttendanceStatistics);

// Update single attendance record
router.put('/:attendanceId', 
  authorizeTeacherOrAdmin,
  validate(attendanceSchemas.updateAttendance),
  attendanceController.updateAttendance
);

// Delete attendance record
router.delete('/:attendanceId', 
  authorizeTeacherOrAdmin,
  attendanceController.deleteAttendance
);

// Get attendance calendar for a class schedule
router.get('/class-schedule/:classScheduleId/calendar', 
  authorizeTeacherOrAdmin,
  attendanceController.getAttendanceCalendar
);

// Alternative route for frontend compatibility - Get attendance calendar
router.get('/class/:classScheduleId/calendar', 
  authorizeTeacherOrAdmin,
  attendanceController.getAttendanceCalendar
);

// Bulk update attendance
router.put('/bulk-update', 
  authorizeTeacherOrAdmin,
  validate(attendanceSchemas.bulkUpdateAttendance),
  attendanceController.bulkUpdateAttendance
);

// Get available class schedules for attendance marking
router.get('/class-schedules', 
  authorizeTeacherOrAdmin,
  attendanceController.getAvailableClassSchedules
);

module.exports = router;