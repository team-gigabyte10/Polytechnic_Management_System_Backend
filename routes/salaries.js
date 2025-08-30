const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, salarySchemas } = require('../middleware/validation');

// Protect all salary routes
router.use(authenticateToken);

// Generate monthly salaries - Only admin
router.post('/generate', 
  authorize('admin'),
  validate(salarySchemas.generateMonthly), 
  salaryController.generateMonthlySalaries
);

// Get all salaries - Admin can view all, teachers can view their own
router.get('/', salaryController.getAllSalaries);

// Mark salary as paid - Only admin
router.put('/:id/pay', 
  authorize('admin'),
  salaryController.markSalaryAsPaid
);

// Update salary - Only admin
router.put('/:id', 
  authorize('admin'),
  validate(salarySchemas.updateSalary), 
  salaryController.updateSalary
);

// Get salary report - Only admin
router.get('/report', 
  authorize('admin'),
  salaryController.getSalaryReport
);

module.exports = router;