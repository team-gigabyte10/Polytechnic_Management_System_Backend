const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

// Public routes
router.post('/register', validate(userSchemas.register), authController.register);
router.post('/login', validate(userSchemas.login), authController.login);

// Protected routes
router.use(authenticateToken);
router.get('/profile', authController.getProfile);
router.put('/profile', validate(userSchemas.updateProfile), authController.updateProfile);
router.put('/change-password', validate(userSchemas.changePassword), authController.changePassword);

module.exports = router;