# Polytechnic Management System - Backend

A comprehensive Node.js + Express.js backend system for managing polytechnic institutions with HRM and Accounts modules.

## 🚀 Features

### Core Modules
- **Authentication System** - JWT-based login for students, teachers, and admin
- **Student Management** - Complete CRUD operations for student profiles
- **Teacher Management** - Regular and guest teacher management
- **HRM Module** - Human Resource Management with guest teacher specialization
- **Class Schedule & Attendance** - Advanced attendance tracking with rewards/fines
- **Marks/Results System** - Student performance tracking
- **Accounts Module** - Financial management (salaries, payments, expenses)
- **Notifications** - Announcement system

### Advanced Features
- **Role-based Access Control** - Admin, Teacher, Student, Guest permissions
- **Attendance Rewards/Fines** - Automated calculation based on attendance percentage
- **Guest Teacher Payment System** - Flexible payment structures (hourly, per-class, per-session)
- **Financial Reporting** - Comprehensive salary and expense reports
- **Data Validation** - Robust input validation using Joi
- **Error Handling** - Centralized error management
- **Rate Limiting** - API protection against abuse

## 🏗️ Architecture

### Database Schema (MySQL)
- **Normalized to 3NF** with proper foreign keys and indexes
- **12 Core Tables** with relationships and constraints
- **Optimized Queries** with strategic indexing

### API Structure
- **RESTful Architecture** with clear endpoint naming
- **MVC Pattern** - Models, Controllers, Routes separation
- **Middleware Layer** - Authentication, validation, error handling
- **Modular Design** - Easy to extend and maintain

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure database credentials
3. Set JWT secrets
4. Configure other environment variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=polytechnic_management
DB_USER=root
DB_PASS=your_password

# JWT Configuration  
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE polytechnic_management;
```

2. Import schema:
```bash
mysql -u root -p polytechnic_management < database/schema.sql
```

### Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production server
npm start
```

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # User login
GET    /api/auth/profile        # Get current user profile
PUT    /api/auth/profile        # Update profile
PUT    /api/auth/change-password # Change password
```

### Student Management
```
GET    /api/students            # Get all students
GET    /api/students/:id        # Get student by ID
POST   /api/students            # Create new student
PUT    /api/students/:id        # Update student
DELETE /api/students/:id        # Delete student
GET    /api/students/:id/attendance-summary # Attendance summary
GET    /api/students/:id/payment-history    # Payment history
```

### Attendance Management
```
POST   /api/attendance/mark                    # Mark attendance
GET    /api/attendance/class/:classId          # Get class attendance
GET    /api/attendance/student/:studentId/report # Student attendance report
GET    /api/attendance/class/:classId/summary    # Class attendance summary
GET    /api/attendance/rewards-fines             # Attendance rewards/fines
```

### Salary Management
```
POST   /api/salaries/generate   # Generate monthly salaries
GET    /api/salaries           # Get all salaries
PUT    /api/salaries/:id/pay   # Mark salary as paid
PUT    /api/salaries/:id       # Update salary
GET    /api/salaries/report    # Salary report
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```javascript
{
  userId: number,
  email: string,
  role: 'admin' | 'teacher' | 'student' | 'guest'
}
```

### Role Permissions
- **Admin**: Full system access
- **Teacher**: Student management, attendance, marks
- **Student**: Own profile, attendance view, payments
- **Guest**: Limited teaching-related access

## 💰 Financial System

### Salary Calculation
- **Regular Teachers**: Fixed monthly salary
- **Guest Teachers**: 
  - Hourly rate × hours taught
  - Per-class rate × classes conducted
  - Per-session rate × sessions completed
  - Fixed monthly rate

### Attendance Rewards & Fines
- **95%+ attendance**: ₹500 reward
- **85-94% attendance**: ₹200 reward  
- **Below 75% attendance**: ₹100 fine

### Expense Categories
- Salary, Utilities, Maintenance, Equipment
- Supplies, Transport, Marketing, Other

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - API abuse prevention
- **CORS Protection** - Cross-origin request control
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Comprehensive data validation
- **SQL Injection Protection** - Parameterized queries
- **Password Hashing** - bcrypt encryption

## 📊 Database Relationships

```
Users (1) → (1) Students/Teachers/GuestTeachers
Departments (1) → (∞) Students, Teachers, Courses
Courses (1) → (∞) Students, Subjects
Classes (1) → (∞) Attendance records
Students (1) → (∞) Attendance, Marks, Payments
Teachers (1) → (∞) Classes, Salaries
```

## 🔄 Error Handling

Centralized error handling with:
- **Validation Errors** - 400 Bad Request
- **Authentication Errors** - 401 Unauthorized  
- **Authorization Errors** - 403 Forbidden
- **Not Found Errors** - 404 Not Found
- **Server Errors** - 500 Internal Server Error

## 📈 Performance Optimizations

- **Database Indexing** - Strategic indexes for fast queries
- **Connection Pooling** - Efficient database connections
- **Rate Limiting** - Prevents API abuse
- **Pagination** - Large dataset handling
- **Eager Loading** - Optimized data fetching

## 🧪 Testing

```bash
# Run tests
npm test

# Test with coverage
npm run test:coverage
```

## 📁 Project Structure

```
polytechnic-management-system/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Business logic
│   ├── authController.js
│   ├── studentController.js
│   ├── attendanceController.js
│   └── salaryController.js
├── middleware/              # Custom middleware
│   ├── auth.js             # Authentication middleware
│   ├── validation.js       # Input validation
│   └── errorHandler.js     # Error handling
├── models/                 # Database models
│   ├── index.js
│   ├── User.js
│   ├── Student.js
│   └── [other models]
├── routes/                 # API routes
│   ├── index.js
│   ├── auth.js
│   ├── students.js
│   └── [other routes]
├── database/
│   └── schema.sql          # Database schema
├── .env.example            # Environment variables template
├── server.js               # Application entry point
└── package.json
```

## 🚀 Deployment

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure production database
- [ ] Enable SSL/HTTPS
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Test all endpoints

### Docker Deployment
```bash
# Build image
docker build -t polytechnic-api .

# Run container
docker run -p 3000:3000 --env-file .env polytechnic-api
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@polytechnic-system.com
- Documentation: [API Docs](./docs/api.md)

---

**Built with ❤️ for educational institutions**