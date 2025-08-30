const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Protect all users routes
router.use(authenticateToken);

// List users - only admin
router.get('/', authorize('admin'), userController.getAllUsers);

module.exports = router;
