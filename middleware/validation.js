const Joi = require('joi');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property]);
    
    if (error) {
      const errorMessage = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    req[property] = value;
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
    role: Joi.string().valid('admin', 'teacher', 'student', 'guest').required(),
    profileData: Joi.object().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    profileData: Joi.object().optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(50).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

// Student validation schemas
const studentSchemas = {
  create: Joi.object({
    userData: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(50).required()
    }).required(),
    studentData: Joi.object({
      rollNumber: Joi.string().min(1).max(20).required(),
      departmentId: Joi.number().integer().positive().required(),
      semester: Joi.number().integer().min(1).max(8).required(),
      admissionYear: Joi.number().integer().min(2000).max(new Date().getFullYear()).required(),
      guardianName: Joi.string().max(100).allow('', null).optional(),
      guardianPhone: Joi.string().allow('', null).optional(),
      phone: Joi.string().max(15).allow('', null).optional(),
      additionalPhone: Joi.string().allow('', null).optional(),
      address: Joi.string().allow('', null).optional()
    })
    .rename('department_id', 'departmentId', { ignoreUndefined: true })
    .required()
  }),

  update: Joi.object({
    userData: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional()
    }).optional(),
    studentData: Joi.object({
      rollNumber: Joi.string().min(1).max(20).optional(),
      departmentId: Joi.number().integer().positive().optional(),
      semester: Joi.number().integer().min(1).max(8).optional(),
      admissionYear: Joi.number().integer().min(2000).max(new Date().getFullYear()).optional(),
      guardianName: Joi.string().max(100).allow('', null).optional(),
      guardianPhone: Joi.string().max(15).allow('', null).optional(),
      phone: Joi.string().max(15).allow('', null).optional(),
      additionalPhone: Joi.string().max(15).allow('', null).optional(),
      address: Joi.string().allow('', null).optional()
    })
    .rename('department_id', 'departmentId', { ignoreUndefined: true })
    .optional()
  })
};

// Teacher validation schemas
const teacherSchemas = {
  create: Joi.object({
    userData: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(50).required()
    }).required(),
    teacherData: Joi.object({
      employeeId: Joi.string().min(1).max(20).required(),
      departmentId: Joi.number().integer().positive().required(),
      designation: Joi.string().max(50).optional(),
      qualification: Joi.string().max(200).optional(),
      experienceYears: Joi.number().integer().min(0).optional(),
      salary: Joi.number().positive().optional(),
      joiningDate: Joi.date().optional(),
      phone: Joi.string().max(15).optional(),
      address: Joi.string().optional()
    }).required()
  }),

  update: Joi.object({
    userData: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional()
    }).optional(),
    teacherData: Joi.object({
      employeeId: Joi.string().min(1).max(20).optional(),
      departmentId: Joi.number().integer().positive().optional(),
      designation: Joi.string().max(50).allow('').optional(),
      qualification: Joi.string().max(200).allow('').optional(),
      experienceYears: Joi.number().integer().min(0).optional(),
      salary: Joi.number().positive().optional(),
      joiningDate: Joi.date().optional(),
      phone: Joi.string().max(15).allow('').optional(),
      address: Joi.string().allow('').optional()
    }).optional()
  })
};

// Guest Teacher validation schemas
const guestTeacherSchemas = {
  create: Joi.object({
    userData: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(50).required()
    }).required(),
    guestTeacherData: Joi.object({
      employeeId: Joi.string().min(1).max(20).required(),
      departmentId: Joi.number().integer().positive().required(),
      paymentType: Joi.string().valid('hourly', 'per_class', 'per_session', 'monthly').required(),
      rate: Joi.number().positive().required(),
      qualification: Joi.string().max(200).optional(),
      phone: Joi.string().max(15).optional(),
      address: Joi.string().optional()
    }).required()
  }),

  update: Joi.object({
    userData: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional()
    }).optional(),
    guestTeacherData: Joi.object({
      employeeId: Joi.string().min(1).max(20).optional(),
      departmentId: Joi.number().integer().positive().optional(),
      paymentType: Joi.string().valid('hourly', 'per_class', 'per_session', 'monthly').optional(),
      rate: Joi.number().positive().optional(),
      qualification: Joi.string().max(200).allow('').optional(),
      phone: Joi.string().max(15).allow('').optional(),
      address: Joi.string().allow('').optional()
    }).optional()
  })
};

// Attendance validation schemas
const attendanceSchemas = {
  markAttendance: Joi.object({
    classScheduleId: Joi.number().integer().positive().required(),
    date: Joi.date().required(),
    attendanceList: Joi.array().items(
      Joi.object({
        studentId: Joi.number().integer().positive().required(),
        status: Joi.string().valid('present', 'absent', 'late').required()
      })
    ).min(1).required()
  }),

  updateAttendance: Joi.object({
    status: Joi.string().valid('present', 'absent', 'late').required()
  }),

  bulkUpdateAttendance: Joi.object({
    classScheduleId: Joi.number().integer().positive().required(),
    date: Joi.date().required(),
    updates: Joi.array().items(
      Joi.object({
        studentId: Joi.number().integer().positive().required(),
        status: Joi.string().valid('present', 'absent', 'late').required()
      })
    ).min(1).required()
  })
};

// Salary validation schemas
const salarySchemas = {
  generateMonthly: Joi.object({
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).required()
  }),

  updateSalary: Joi.object({
    baseAmount: Joi.number().positive().required(),
    bonus: Joi.number().min(0).default(0),
    deductions: Joi.number().min(0).default(0)
  })
};

// Payment validation schemas
const paymentSchemas = {
  create: Joi.object({
    studentId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().required(),
    paymentType: Joi.string().valid('tuition_fee', 'admission_fee', 'exam_fee', 'library_fee', 'lab_fee', 'other').required(),
    semester: Joi.number().integer().min(1).max(8).optional(),
    academicYear: Joi.string().max(10).optional(),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'online', 'cheque').default('cash'),
    transactionId: Joi.string().max(100).optional(),
    dueDate: Joi.date().optional(),
    lateFee: Joi.number().min(0).default(0),
    discount: Joi.number().min(0).default(0)
  })
};

// Course validation schemas
const courseSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(150).required(),
    code: Joi.string().min(2).max(20).required(),
    departmentId: Joi.number().integer().positive().required(),
    durationYears: Joi.number().integer().min(1).max(10).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(150).optional(),
    code: Joi.string().min(2).max(20).optional(),
    departmentId: Joi.number().integer().positive().optional(),
    durationYears: Joi.number().integer().min(1).max(10).optional()
  })
};

// Department validation schemas
const departmentSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    code: Joi.string().min(1).max(10).required(),
    headId: Joi.number().integer().positive().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    code: Joi.string().min(1).max(10).optional(),
    headId: Joi.number().integer().positive().allow(null).optional()
  })
};


// Expense validation schemas
const expenseSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().optional(),
    amount: Joi.number().positive().required(),
    category: Joi.string().valid('salary', 'utilities', 'maintenance', 'equipment', 'supplies', 'transport', 'marketing', 'other').required(),
    expenseDate: Joi.date().required(),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'cheque', 'online').default('cash'),
    receiptNumber: Joi.string().max(50).optional(),
    vendorName: Joi.string().max(100).optional(),
    departmentId: Joi.number().integer().positive().optional()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().optional(),
    amount: Joi.number().positive().optional(),
    category: Joi.string().valid('salary', 'utilities', 'maintenance', 'equipment', 'supplies', 'transport', 'marketing', 'other').optional(),
    expenseDate: Joi.date().optional(),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'cheque', 'online').optional(),
    receiptNumber: Joi.string().max(50).allow('').optional(),
    vendorName: Joi.string().max(100).allow('').optional(),
    departmentId: Joi.number().integer().positive().allow(null).optional()
  })
};

// Subject validation schemas
const subjectSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    code: Joi.string().min(1).max(20).required(),
    departmentId: Joi.number().integer().positive().required(),
    semester: Joi.number().integer().min(1).max(8).required(),
    credits: Joi.number().integer().min(1).max(10).default(3),
    theoryHours: Joi.number().integer().min(0).max(20).default(3),
    practicalHours: Joi.number().integer().min(0).max(20).default(0)
  })
  .rename('department_id', 'departmentId', { ignoreUndefined: true })
  .custom((value, helpers) => {
    // Validate that total hours don't exceed reasonable limits
    const totalHours = value.theoryHours + value.practicalHours;
    if (totalHours > 30) {
      return helpers.error('custom.totalHours');
    }
    
    return value;
  }).messages({
    'custom.totalHours': 'Total hours (theory + practical) cannot exceed 30 hours per week'
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    code: Joi.string().min(1).max(20).optional(),
    departmentId: Joi.number().integer().positive().optional(),
    semester: Joi.number().integer().min(1).max(8).optional(),
    credits: Joi.number().integer().min(1).max(10).optional(),
    theoryHours: Joi.number().integer().min(0).max(20).optional(),
    practicalHours: Joi.number().integer().min(0).max(20).optional()
  })
  .rename('department_id', 'departmentId', { ignoreUndefined: true })
  .custom((value, helpers) => {
    // Validate total hours if both are provided
    if (value.theoryHours !== undefined && value.practicalHours !== undefined) {
      const totalHours = value.theoryHours + value.practicalHours;
      if (totalHours > 30) {
        return helpers.error('custom.totalHours');
      }
    }
    
    return value;
  }).messages({
    'custom.totalHours': 'Total hours (theory + practical) cannot exceed 30 hours per week'
  })
};

// Class Schedule validation schemas
const classScheduleSchemas = {
  create: Joi.object({
    subjectId: Joi.number().integer().positive().required(),
    teacherId: Joi.number().integer().positive().optional(),
    guestTeacherId: Joi.number().integer().positive().optional(),
    roomNumber: Joi.string().max(20).optional(),
    scheduleDay: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).required(),
    classType: Joi.string().valid('theory', 'practical', 'lab', 'tutorial', 'seminar').default('theory'),
    semester: Joi.number().integer().min(1).max(8).required(),
    academicYear: Joi.string().max(10).required(),
    maxStudents: Joi.number().integer().min(1).max(200).default(30),
    isRecurring: Joi.boolean().default(true),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    notes: Joi.string().optional(),
    isActive: Joi.boolean().default(true),
    departmentId: Joi.number().integer().positive().optional().strip() // Allow but ignore departmentId
  }).custom((value, helpers) => {
    // Custom validation to ensure exactly one of teacherId or guestTeacherId is provided
    if (value.teacherId && value.guestTeacherId) {
      return helpers.error('custom.teacherAssignment');
    }
    
    // Ensure at least one teacher is assigned
    if (!value.teacherId && !value.guestTeacherId) {
      return helpers.error('custom.teacherRequired');
    }
    
    // Validate that end time is after start time
    const startTime = new Date(`2000-01-01T${value.startTime}:00`);
    const endTime = new Date(`2000-01-01T${value.endTime}:00`);
    if (endTime <= startTime) {
      return helpers.error('custom.timeOrder');
    }
    
    // Validate that end date is after start date (if both provided)
    if (value.startDate && value.endDate) {
      const startDate = new Date(value.startDate);
      const endDate = new Date(value.endDate);
      if (endDate <= startDate) {
        return helpers.error('custom.dateOrder');
      }
    }
    
    return value;
  }).messages({
    'custom.teacherAssignment': 'Class schedule cannot have both a teacher and a guest teacher at the same time',
    'custom.teacherRequired': 'Either a teacher or guest teacher must be assigned to the class schedule',
    'custom.timeOrder': 'End time must be after start time',
    'custom.dateOrder': 'End date must be after start date'
  }),

  update: Joi.object({
    subjectId: Joi.number().integer().positive().optional(),
    teacherId: Joi.number().integer().positive().allow(null).optional(),
    guestTeacherId: Joi.number().integer().positive().allow(null).optional(),
    roomNumber: Joi.string().max(20).allow('').optional(),
    scheduleDay: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').optional(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
    classType: Joi.string().valid('theory', 'practical', 'lab', 'tutorial', 'seminar').optional(),
    semester: Joi.number().integer().min(1).max(8).optional(),
    academicYear: Joi.string().max(10).optional(),
    maxStudents: Joi.number().integer().min(1).max(200).optional(),
    isRecurring: Joi.boolean().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    notes: Joi.string().allow('').optional(),
    isActive: Joi.boolean().optional(),
    departmentId: Joi.number().integer().positive().optional().strip() // Allow but ignore departmentId
  }).custom((value, helpers) => {
    // Custom validation for teacher assignment
    const teacherId = value.teacherId;
    const guestTeacherId = value.guestTeacherId;
    
    // Check if both are provided (not allowed)
    if (teacherId !== undefined && guestTeacherId !== undefined) {
      if (teacherId && guestTeacherId) {
        return helpers.error('custom.teacherAssignment');
      }
    }
    
    // For update, we don't require at least one teacher if neither is provided
    // (allowing partial updates), but if one is being set, ensure the other is null/undefined
    
    // Validate time order if both times are provided
    if (value.startTime && value.endTime) {
      const startTime = new Date(`2000-01-01T${value.startTime}:00`);
      const endTime = new Date(`2000-01-01T${value.endTime}:00`);
      if (endTime <= startTime) {
        return helpers.error('custom.timeOrder');
      }
    }
    
    // Validate date order if both dates are provided
    if (value.startDate && value.endDate) {
      const startDate = new Date(value.startDate);
      const endDate = new Date(value.endDate);
      if (endDate <= startDate) {
        return helpers.error('custom.dateOrder');
      }
    }
    
    return value;
  }).messages({
    'custom.teacherAssignment': 'Class schedule cannot have both a teacher and a guest teacher at the same time',
    'custom.timeOrder': 'End time must be after start time',
    'custom.dateOrder': 'End date must be after start date'
  })
};

// Mark validation schemas
const markSchemas = {
  create: Joi.object({
    subjectId: Joi.number().integer().positive().required(),
    studentId: Joi.number().integer().positive().required(),
    examType: Joi.string().valid('quiz', 'midterm', 'final', 'assignment', 'project').required(),
    totalMarks: Joi.number().positive().max(1000).required(),
    obtainedMarks: Joi.number().min(0).max(1000).required(),
    grade: Joi.string().max(2).optional(),
    examDate: Joi.date().iso().optional()
  }).custom((value, helpers) => {
    // Validate that obtained marks don't exceed total marks
    if (value.obtainedMarks > value.totalMarks) {
      return helpers.error('custom.marksExceed');
    }
    return value;
  }).messages({
    'custom.marksExceed': 'Obtained marks cannot exceed total marks'
  }),

  update: Joi.object({
    subjectId: Joi.number().integer().positive().optional(),
    studentId: Joi.number().integer().positive().optional(),
    examType: Joi.string().valid('quiz', 'midterm', 'final', 'assignment', 'project').optional(),
    totalMarks: Joi.number().positive().max(1000).optional(),
    obtainedMarks: Joi.number().min(0).max(1000).optional(),
    grade: Joi.string().max(2).optional(),
    examDate: Joi.date().iso().optional()
  }).custom((value, helpers) => {
    // Validate that obtained marks don't exceed total marks if both are provided
    if (value.obtainedMarks !== undefined && value.totalMarks !== undefined) {
      if (value.obtainedMarks > value.totalMarks) {
        return helpers.error('custom.marksExceed');
      }
    }
    return value;
  }).messages({
    'custom.marksExceed': 'Obtained marks cannot exceed total marks'
  }),

  bulkCreate: Joi.object({
    marks: Joi.array().items(
      Joi.object({
        subjectId: Joi.number().integer().positive().required(),
        studentId: Joi.number().integer().positive().required(),
        examType: Joi.string().valid('quiz', 'midterm', 'final', 'assignment', 'project').required(),
        totalMarks: Joi.number().positive().max(1000).required(),
        obtainedMarks: Joi.number().min(0).max(1000).required(),
        grade: Joi.string().max(2).optional(),
        examDate: Joi.date().iso().optional()
      }).custom((value, helpers) => {
        // Validate that obtained marks don't exceed total marks
        if (value.obtainedMarks > value.totalMarks) {
          return helpers.error('custom.marksExceed');
        }
        return value;
      })
    ).min(1).max(100).required()
  }).messages({
    'custom.marksExceed': 'Obtained marks cannot exceed total marks'
  })
};

module.exports = {
  validate,
  userSchemas,
  studentSchemas,
  teacherSchemas,
  guestTeacherSchemas,
  attendanceSchemas,
  salarySchemas,
  paymentSchemas,
  expenseSchemas,
  courseSchemas,
  departmentSchemas,
  subjectSchemas,
  classScheduleSchemas,
  markSchemas
};