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
      courseId: Joi.number().integer().positive().required(),
      semester: Joi.number().integer().min(1).max(8).required(),
      admissionYear: Joi.number().integer().min(2000).max(new Date().getFullYear()).required(),
      guardianName: Joi.string().max(100).optional(),
      guardianPhone: Joi.string().max(15).optional(),
      address: Joi.string().optional()
    }).required()
  }),

  update: Joi.object({
    userData: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional()
    }).optional(),
    studentData: Joi.object({
      rollNumber: Joi.string().min(1).max(20).optional(),
      departmentId: Joi.number().integer().positive().optional(),
      courseId: Joi.number().integer().positive().optional(),
      semester: Joi.number().integer().min(1).max(8).optional(),
      admissionYear: Joi.number().integer().min(2000).max(new Date().getFullYear()).optional(),
      guardianName: Joi.string().max(100).allow('').optional(),
      guardianPhone: Joi.string().max(15).allow('').optional(),
      address: Joi.string().allow('').optional()
    }).optional()
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
      salary: Joi.number().positive().required(),
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
    classId: Joi.number().integer().positive().required(),
    date: Joi.date().required(),
    attendanceList: Joi.array().items(
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

module.exports = {
  validate,
  userSchemas,
  studentSchemas,
  teacherSchemas,
  guestTeacherSchemas,
  attendanceSchemas,
  salarySchemas,
  paymentSchemas,
  expenseSchemas
};