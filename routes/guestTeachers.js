const express = require('express');
const router = express.Router();
const guestTeacherController = require('../controllers/guestTeacherController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, guestTeacherSchemas } = require('../middleware/validation');

// Protect all guest teacher routes
router.use(authenticateToken);

// Get all guest teachers - Admin and teachers can view
router.get('/', authorize(['admin', 'teacher']), guestTeacherController.getAllGuestTeachers);

// Get guest teacher by ID - Admin, teachers, and the guest teacher themselves can view
router.get('/:id', guestTeacherController.getGuestTeacherById);

// Create new guest teacher - Only admin can create
router.post('/', 
  authorize(['admin']), 
  validate(guestTeacherSchemas.create), 
  guestTeacherController.createGuestTeacher
);

// Update guest teacher - Admin and the guest teacher themselves can update
router.put('/:id', 
  authorize(['admin', 'teacher']), 
  validate(guestTeacherSchemas.update), 
  guestTeacherController.updateGuestTeacher
);

// Delete guest teacher - Only admin can delete
router.delete('/:id', 
  authorize(['admin']), 
  guestTeacherController.deleteGuestTeacher
);

// Deactivate guest teacher (soft delete) - Only admin can deactivate
router.put('/:id/deactivate', 
  authorize(['admin']), 
  guestTeacherController.deactivateGuestTeacher
);

// Get guest teacher classes - Admin, teachers, and the guest teacher themselves can view
router.get('/:id/classes', 
  authorize(['admin', 'teacher']), 
  guestTeacherController.getGuestTeacherClasses
);

// Get guest teacher salary history - Admin and the guest teacher themselves can view
router.get('/:id/salary-history', 
  authorize(['admin', 'teacher']), 
  guestTeacherController.getGuestTeacherSalaryHistory
);

// Get guest teacher teaching sessions - Admin, teachers, and the guest teacher themselves can view
router.get('/:id/teaching-sessions', 
  authorize(['admin', 'teacher']), 
  guestTeacherController.getGuestTeacherTeachingSessions
);

// Update guest teacher statistics - Admin and the guest teacher themselves can update
router.put('/:id/update-stats', 
  authorize(['admin', 'teacher']), 
  guestTeacherController.updateGuestTeacherStats
);

module.exports = router;
