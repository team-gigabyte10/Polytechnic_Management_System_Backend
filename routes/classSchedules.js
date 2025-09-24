const express = require('express');
const router = express.Router();
const classScheduleController = require('../controllers/classScheduleController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, classScheduleSchemas } = require('../middleware/validation');

// Test endpoint (no auth required for testing)
router.get('/test', classScheduleController.testEndpoint);

// Simple test endpoint to get all schedules (no auth for testing)
router.get('/all', classScheduleController.getAllClassSchedules);

// Simple endpoint to get all schedules without complex includes (no auth for testing)
router.get('/simple', classScheduleController.getAllClassSchedulesSimple);

// Protect all class schedule routes
router.use(authenticateToken);

// Get all class schedules with filtering and pagination - Admin and teachers can view
router.get('/', authorize(['admin', 'teacher']), classScheduleController.getAllClassSchedules);

// Get weekly schedule - Admin, teachers, and students can view
router.get('/weekly-schedule', authorize(['admin', 'teacher', 'student']), classScheduleController.getWeeklySchedule);

// Get class schedules by academic year and semester - Admin, teachers, and students can view
router.get('/academic-period/:academicYear/:semester', 
  authorize(['admin', 'teacher', 'student']), 
  classScheduleController.getClassSchedulesByAcademicPeriod
);

// Get class schedule by ID - Admin, teachers, and students can view
router.get('/:id', authorize(['admin', 'teacher', 'student']), classScheduleController.getClassScheduleById);

// Create new class schedule - Only admin can create
router.post('/', 
  authorize(['admin']), 
  validate(classScheduleSchemas.create), 
  classScheduleController.createClassSchedule
);

// Update class schedule - Only admin can update
router.put('/:id', 
  authorize(['admin']), 
  validate(classScheduleSchemas.update), 
  classScheduleController.updateClassSchedule
);

// Delete class schedule - Only admin can delete
router.delete('/:id', 
  authorize(['admin']), 
  classScheduleController.deleteClassSchedule
);

// Get class schedules by teacher - Admin and the specific teacher can view
router.get('/teacher/:teacherId', 
  authorize(['admin', 'teacher']), 
  classScheduleController.getClassSchedulesByTeacher
);

// Get class schedules by guest teacher - Admin and the specific guest teacher can view
router.get('/guest-teacher/:guestTeacherId', 
  authorize(['admin', 'teacher']), 
  classScheduleController.getClassSchedulesByGuestTeacher
);

// Get class schedules by subject - Admin, teachers, and students can view
router.get('/subject/:subjectId', 
  authorize(['admin', 'teacher', 'student']), 
  classScheduleController.getClassSchedulesBySubject
);

// Get class schedules by room - Admin, teachers, and students can view
router.get('/room/:roomNumber', 
  authorize(['admin', 'teacher', 'student']), 
  classScheduleController.getClassSchedulesByRoom 
);

module.exports = router;
