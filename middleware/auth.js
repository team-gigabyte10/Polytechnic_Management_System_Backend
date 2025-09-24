const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Verify user still exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    // Set req.user with both JWT payload and database user info
    req.user = {
      ...decoded,
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user has required role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Flatten the roles array to handle nested arrays
    const flatRoles = roles.flat();

    // Debug logging
    console.log('🔍 Authorization Debug:');
    console.log('  User ID:', req.user.userId);
    console.log('  User Role:', req.user.role);
    console.log('  Original Roles:', roles);
    console.log('  Flattened Roles:', flatRoles);
    console.log('  User Role Type:', typeof req.user.role);

    // More robust role checking
    const userRole = req.user.role ? req.user.role.toString().toLowerCase().trim() : null;
    const hasRole = flatRoles.some(role => role.toString().toLowerCase().trim() === userRole);
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        debug: {
          userRole: req.user.role,
          userRoleNormalized: userRole,
          originalRoles: roles,
          flattenedRoles: flatRoles,
          userRoleType: typeof req.user.role,
          hasRole: hasRole
        }
      });
    }

    next();
  };
};

// Check if user is admin or owns the resource
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user.userId == resourceUserId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};

// Check if user is teacher or admin for academic operations
const authorizeTeacherOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (['admin', 'teacher', 'guest'].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Only teachers and administrators can perform this action'
    });
  }
};

module.exports = {
  authenticateToken,
  authorize,
  authorizeOwnerOrAdmin,
  authorizeTeacherOrAdmin
};