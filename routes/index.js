const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const studentRoutes = require('./students');
const teacherRoutes = require('./teachers');
const attendanceRoutes = require('./attendance');
const dashboardRoutes = require('./dashboard');
const salaryRoutes = require('./salaries');
const userRoutes = require('./users');

const departmentRoutes = require('./departments');
const classScheduleRoutes = require('./classSchedules');
const guestTeacherRoutes = require('./guestTeachers');
const subjectRoutes = require('./subjects');
const markRoutes = require('./marks');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Polytechnic Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API index endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Polytechnic Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
          endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        students: '/api/students',
        teachers: '/api/teachers',
        attendance: '/api/attendance',
        salaries: '/api/salaries',

        departments: '/api/departments',
        classSchedules: '/api/class-schedules',
        guestTeachers: '/api/guest-teachers',
        subjects: '/api/subjects',
        marks: '/api/marks',
        users: '/api/users',
        dashboard: '/api/dashboard'
      }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/salaries', salaryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

router.use('/departments', departmentRoutes);
router.use('/class-schedules', classScheduleRoutes);
router.use('/guest-teachers', guestTeacherRoutes);
router.use('/subjects', subjectRoutes);
router.use('/marks', markRoutes);

module.exports = router;
