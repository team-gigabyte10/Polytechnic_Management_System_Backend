# Subject API Documentation

## Overview
The Subject API provides comprehensive CRUD operations for managing academic subjects in the Polytechnic Management System. Subjects are linked to courses and contain information about credits, hours, and semester details.

## API Endpoints

### 1. Get All Subjects
```
GET /api/subjects
Authorization: Bearer <token>
```

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `course` (optional): Filter by course ID
- `semester` (optional): Filter by semester (1-8)
- `department` (optional): Filter by department ID
- `search` (optional): Search by subject name or code
- `credits` (optional): Filter by credit hours

#### Example Request
```bash
GET /api/subjects?page=1&limit=5&course=1&semester=2&search=Data
Authorization: Bearer <token>
```

#### Response
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": 1,
        "name": "Data Structures",
        "code": "CS201",
        "courseId": 1,
        "semester": 2,
        "credits": 3,
        "theoryHours": 3,
        "practicalHours": 1,
        "created_at": "2025-01-20T10:00:00.000Z",
        "updated_at": "2025-01-20T10:00:00.000Z",
        "course": {
          "name": "Computer Science Engineering",
          "code": "CSE",
          "durationYears": 4,
          "department": {
            "name": "Computer Science",
            "code": "CSE"
          }
        }
      }
    ],
    "pagination": {
      "total": 1,
      "pages": 1,
      "currentPage": 1,
      "perPage": 5
    }
  }
}
```

### 2. Get Subject by ID
```
GET /api/subjects/:id
Authorization: Bearer <token>
```

#### Response
```json
{
  "success": true,
  "data": {
    "subject": {
      "id": 1,
      "name": "Data Structures",
      "code": "CS201",
      "courseId": 1,
      "semester": 2,
      "credits": 3,
      "theoryHours": 3,
      "practicalHours": 1,
      "course": {
        "name": "Computer Science Engineering",
        "code": "CSE",
        "department": {
          "name": "Computer Science",
          "code": "CSE"
        }
      },
      "classes": [
        {
          "id": 1,
          "scheduleDay": "monday",
          "startTime": "09:00:00",
          "endTime": "10:00:00",
          "teacher": {
            "employeeId": "T001",
            "user": {
              "name": "John Doe"
            }
          }
        }
      ]
    }
  }
}
```

### 3. Create Subject
```
POST /api/subjects
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Data Structures",
  "code": "CS201",
  "courseId": 1,
  "semester": 2,
  "credits": 3,
  "theoryHours": 3,
  "practicalHours": 1
}
```

#### Response
```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": {
    "subject": {
      "id": 1,
      "name": "Data Structures",
      "code": "CS201",
      "courseId": 1,
      "semester": 2,
      "credits": 3,
      "theoryHours": 3,
      "practicalHours": 1,
      "course": {
        "name": "Computer Science Engineering",
        "code": "CSE",
        "department": {
          "name": "Computer Science",
          "code": "CSE"
        }
      }
    }
  }
}
```

### 4. Update Subject
```
PUT /api/subjects/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Advanced Data Structures",
  "credits": 4,
  "theoryHours": 4,
  "practicalHours": 2
}
```

#### Response
```json
{
  "success": true,
  "message": "Subject updated successfully",
  "data": {
    "subject": {
      "id": 1,
      "name": "Advanced Data Structures",
      "code": "CS201",
      "courseId": 1,
      "semester": 2,
      "credits": 4,
      "theoryHours": 4,
      "practicalHours": 2,
      "course": {
        "name": "Computer Science Engineering",
        "code": "CSE",
        "department": {
          "name": "Computer Science",
          "code": "CSE"
        }
      }
    }
  }
}
```

### 5. Delete Subject
```
DELETE /api/subjects/:id
Authorization: Bearer <token>
```

#### Query Parameters
- `force` (optional): Force delete ignoring dependencies (default: false)

#### Response
```json
{
  "success": true,
  "message": "Subject deleted successfully"
}
```

### 6. Get Subjects by Course
```
GET /api/subjects/course/:courseId
Authorization: Bearer <token>
```

#### Query Parameters
- `semester` (optional): Filter by semester

#### Response
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": 1,
        "name": "Data Structures",
        "code": "CS201",
        "semester": 2,
        "credits": 3,
        "course": {
          "name": "Computer Science Engineering",
          "code": "CSE"
        }
      }
    ]
  }
}
```

### 7. Get Subjects by Semester
```
GET /api/subjects/semester/:semester
Authorization: Bearer <token>
```

#### Query Parameters
- `courseId` (optional): Filter by course ID

#### Response
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": 1,
        "name": "Data Structures",
        "code": "CS201",
        "courseId": 1,
        "credits": 3,
        "course": {
          "name": "Computer Science Engineering",
          "code": "CSE",
          "department": {
            "name": "Computer Science",
            "code": "CSE"
          }
        }
      }
    ]
  }
}
```

### 8. Get Subject Statistics
```
GET /api/subjects/:id/stats
Authorization: Bearer <token>
```

#### Response
```json
{
  "success": true,
  "data": {
    "subject": {
      "id": 1,
      "name": "Data Structures",
      "code": "CS201",
      "credits": 3,
      "theoryHours": 3,
      "practicalHours": 1
    },
    "statistics": {
      "totalClasses": 5,
      "activeClasses": 3,
      "totalMarks": 150,
      "totalHours": 4
    }
  }
}
```

## Data Model

### Subject Fields
- `id` (INTEGER, PRIMARY KEY): Unique identifier
- `name` (STRING, 100 chars): Subject name
- `code` (STRING, 20 chars): Unique subject code
- `courseId` (INTEGER): Foreign key to courses table
- `semester` (INTEGER, 1-8): Semester number
- `credits` (INTEGER, 1-10): Credit hours (default: 3)
- `theoryHours` (INTEGER, 0-20): Theory hours per week (default: 3)
- `practicalHours` (INTEGER, 0-20): Practical hours per week (default: 0)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### Relationships
- **Belongs To**: Course (via courseId)
- **Has Many**: Classes (via subjectId)
- **Has Many**: Marks (via subjectId)

## Validation Rules

### Create Subject
- `name`: Required, 1-100 characters
- `code`: Required, 1-20 characters, must be unique
- `courseId`: Required, must exist in courses table
- `semester`: Required, 1-8
- `credits`: Optional, 1-10 (default: 3)
- `theoryHours`: Optional, 0-20 (default: 3)
- `practicalHours`: Optional, 0-20 (default: 0)
- **Custom Validation**: Total hours (theory + practical) cannot exceed 30

### Update Subject
- All fields are optional
- Same validation rules as create
- Code uniqueness checked excluding current record
- Name uniqueness checked within same course and semester

## Authorization

### Access Levels
- **Admin**: Full access to all operations
- **Teacher**: Read access to all subjects
- **Student**: Read access to all subjects
- **Other Users**: No access

### Protected Operations
- **Create**: Admin only
- **Update**: Admin only
- **Delete**: Admin only
- **Read**: Admin, Teacher, Student

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "semester",
      "message": "must be less than or equal to 8"
    }
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Subject not found"
}
```

### Duplicate Code Error
```json
{
  "success": false,
  "message": "Subject with this code already exists"
}
```

### Dependency Error
```json
{
  "success": false,
  "message": "Cannot delete subject. 3 class(es) are assigned to this subject. Use ?force=true to force delete."
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Access token required"
}
```

## Usage Examples

### Create a Subject
```bash
curl -X POST "http://localhost:3000/api/subjects" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Database Management",
    "code": "CS301",
    "courseId": 1,
    "semester": 3,
    "credits": 4,
    "theoryHours": 3,
    "practicalHours": 2
  }'
```

### Search Subjects
```bash
curl -X GET "http://localhost:3000/api/subjects?search=Data&semester=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Subjects by Course
```bash
curl -X GET "http://localhost:3000/api/subjects/course/1?semester=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Subject
```bash
curl -X PUT "http://localhost:3000/api/subjects/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Data Structures",
    "credits": 4
  }'
```

### Delete Subject
```bash
curl -X DELETE "http://localhost:3000/api/subjects/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Features

### ✅ **Comprehensive CRUD Operations**
- Create, Read, Update, Delete subjects
- Full validation and error handling
- Dependency checking for safe deletion

### ✅ **Advanced Filtering and Search**
- Filter by course, semester, department, credits
- Search by subject name or code
- Pagination support

### ✅ **Relationship Management**
- Linked to courses and departments
- Shows associated classes and teachers
- Statistics and analytics

### ✅ **Data Validation**
- Comprehensive input validation
- Business rule validation (total hours limit)
- Uniqueness constraints

### ✅ **Security**
- JWT authentication required
- Role-based authorization
- Protected operations

### ✅ **Performance**
- Optimized database queries
- Proper indexing
- Efficient pagination

## Database Schema

### Table: subjects
```sql
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    course_id INT NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 3,
    theory_hours INT DEFAULT 3,
    practical_hours INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id),
    INDEX idx_subjects_course_semester (course_id, semester),
    INDEX idx_subjects_code (code),
    INDEX idx_subjects_credits (credits)
);
```

## Conclusion

The Subject API provides a complete solution for managing academic subjects with:

1. **Full CRUD Operations** with proper validation
2. **Advanced Filtering** and search capabilities
3. **Relationship Management** with courses and classes
4. **Security** with authentication and authorization
5. **Performance** with optimized queries and pagination
6. **Error Handling** with clear feedback messages

The API is production-ready and follows RESTful conventions with comprehensive documentation and testing.
