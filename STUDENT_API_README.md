# Student API Documentation

This document describes the Student API endpoints for the Polytechnic Management System.

## Base URL
```
/api/students
```

## Authentication
- **All endpoints**: JWT token required in Authorization header
- **Admin-only endpoints**: Only users with 'admin' role can access
- **Self-update endpoints**: Students can update their own profiles

## Endpoints

### 1. Get All Students
**GET** `/api/students`

**Description**: Retrieve all students with optional filtering and pagination

**Authentication**: Required (JWT token)

**Authorization**: Admin or Teacher role

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `department` (optional): Filter by department ID
- `semester` (optional): Filter by semester (1-8)
- `course` (optional): Filter by course ID

**Response**:
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "rollNumber": "STU001",
        "semester": 3,
        "admissionYear": 2023,
        "guardianName": "John Doe Sr.",
        "guardianPhone": "+1234567890",
        "address": "123 Main St",
        "userId": 1,
        "departmentId": 1,
        "courseId": 1,
        "user": {
          "name": "John Doe",
          "email": "john.doe@student.edu",
          "isActive": true
        },
        "department": {
          "name": "Computer Science",
          "code": "CSE"
        },
        "course": {
          "name": "Diploma in CSE",
          "code": "CSE-3Y"
        }
      }
    ],
    "pagination": {
      "total": 50,
      "pages": 5,
      "currentPage": 1,
      "perPage": 10
    }
  }
}
```

### 2. Get Student by ID
**GET** `/api/students/:id`

**Description**: Retrieve a specific student by their ID

**Authentication**: Required (JWT token)

**Path Parameters**:
- `id`: Student ID

**Response**:
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 1,
      "rollNumber": "STU001",
      "semester": 3,
      "admissionYear": 2023,
      "guardianName": "John Doe Sr.",
      "guardianPhone": "+1234567890",
      "address": "123 Main St",
      "userId": 1,
      "departmentId": 1,
      "courseId": 1,
      "user": {
        "name": "John Doe",
        "email": "john.doe@student.edu",
        "isActive": true,
        "createdAt": "2023-01-15T10:00:00.000Z"
      },
      "department": {
        "id": 1,
        "name": "Computer Science",
        "code": "CSE"
      },
      "course": {
        "id": 1,
        "name": "Diploma in CSE",
        "code": "CSE-3Y"
      },
      "attendances": [
        {
          "id": 1,
          "date": "2023-08-20",
          "status": "present",
          "class": {
            "id": 1,
            "subject": {
              "name": "Data Structures",
              "code": "CS201"
            }
          }
        }
      ],
      "marks": [
        {
          "id": 1,
          "marks": 85,
          "examType": "midterm",
          "subject": {
            "name": "Data Structures",
            "code": "CS201"
          }
        }
      ]
    }
  }
}
```

### 3. Create Student
**POST** `/api/students`

**Description**: Create a new student (Admin only)

**Authentication**: Required (JWT token)

**Authorization**: Admin role only

**Request Body**:
```json
{
  "userData": {
    "name": "Jane Smith",
    "email": "jane.smith@student.edu",
    "password": "securePassword123"
  },
  "studentData": {
    "rollNumber": "STU002",
    "departmentId": 1,
    "courseId": 1,
    "semester": 1,
    "admissionYear": 2023,
    "guardianName": "Jane Smith Sr.",
    "guardianPhone": "+1234567891",
    "address": "456 Oak Ave"
  }
}
```

**Validation Rules**:
- `userData.name`: Required, 2-100 characters
- `userData.email`: Required, valid email format, must be unique
- `userData.password`: Required, 6-50 characters
- `studentData.rollNumber`: Required, 1-20 characters, must be unique
- `studentData.departmentId`: Required, must be a valid department ID
- `studentData.courseId`: Required, must be a valid course ID
- `studentData.semester`: Required, 1-8
- `studentData.admissionYear`: Required, 2000-current year

**Response**:
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "student": {
      "id": 2,
      "rollNumber": "STU002",
      "semester": 1,
      "admissionYear": 2023,
      "guardianName": "Jane Smith Sr.",
      "guardianPhone": "+1234567891",
      "address": "456 Oak Ave",
      "userId": 2,
      "departmentId": 1,
      "courseId": 1,
      "user": {
        "name": "Jane Smith",
        "email": "jane.smith@student.edu",
        "role": "student"
      },
      "department": {
        "name": "Computer Science",
        "code": "CSE"
      },
      "course": {
        "name": "Diploma in CSE",
        "code": "CSE-3Y"
      }
    }
  }
}
```

### 4. Update Student
**PUT** `/api/students/:id`

**Description**: Update an existing student (Admin or Student themselves)

**Authentication**: Required (JWT token)

**Authorization**: Admin role or Student updating their own profile

**Path Parameters**:
- `id`: Student ID

**Request Body**:
```json
{
  "userData": {
    "name": "Jane Smith-Updated",
    "email": "jane.updated@student.edu"
  },
  "studentData": {
    "semester": 2,
    "guardianPhone": "+1234567892",
    "address": "456 Oak Ave Updated"
  }
}
```

**Validation Rules**:
- All fields are optional
- `userData.email`: If provided, must be unique (excluding current user)
- `studentData.rollNumber`: If provided, must be unique (excluding current student)
- `studentData.semester`: If provided, must be 1-8
- `studentData.admissionYear`: If provided, must be 2000-current year

**Response**:
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "student": {
      "id": 2,
      "rollNumber": "STU002",
      "semester": 2,
      "admissionYear": 2023,
      "guardianName": "Jane Smith Sr.",
      "guardianPhone": "+1234567892",
      "address": "456 Oak Ave Updated",
      "userId": 2,
      "departmentId": 1,
      "courseId": 1,
      "user": {
        "name": "Jane Smith-Updated",
        "email": "jane.updated@student.edu",
        "role": "student",
        "isActive": true
      },
      "department": {
        "name": "Computer Science",
        "code": "CSE"
      },
      "course": {
        "name": "Diploma in CSE",
        "code": "CSE-3Y"
      }
    }
  }
}
```

### 5. Delete Student
**DELETE** `/api/students/:id`

**Description**: Delete a student (Admin only)

**Authentication**: Required (JWT token)

**Authorization**: Admin role only

**Path Parameters**:
- `id`: Student ID

**Business Rules**:
- Cannot delete if student has attendance records
- Cannot delete if student has marks
- Cannot delete if student has payment records

**Response**:
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Error Response** (if student has dependencies):
```json
{
  "success": false,
  "message": "Cannot delete student. 15 attendance record(s) exist for this student."
}
```

### 6. Get Student Attendance Summary
**GET** `/api/students/:id/attendance-summary`

**Description**: Get attendance summary for a specific student

**Authentication**: Required (JWT token)

**Path Parameters**:
- `id`: Student ID

**Query Parameters**:
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalClasses": 20,
      "present": 18,
      "absent": 1,
      "late": 1,
      "attendancePercentage": "95.00"
    },
    "attendances": [
      {
        "id": 1,
        "date": "2023-08-20",
        "status": "present",
        "class": {
          "id": 1,
          "subject": {
            "name": "Data Structures",
            "code": "CS201"
          }
        }
      }
    ]
  }
}
```

### 7. Get Student Payment History
**GET** `/api/students/:id/payment-history`

**Description**: Get payment history for a specific student

**Authentication**: Required (JWT token)

**Path Parameters**:
- `id`: Student ID

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "amount": 5000,
        "lateFee": 100,
        "discount": 0,
        "paymentDate": "2023-08-01",
        "status": "paid"
      }
    ],
    "totals": {
      "totalAmount": 5000,
      "totalLateFee": 100,
      "totalDiscount": 0
    },
    "pagination": {
      "total": 1,
      "pages": 1,
      "currentPage": 1,
      "perPage": 10
    }
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "userData.name",
      "message": "\"name\" is required"
    }
  ]
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Student not found"
}
```

### Unauthorized Error (401)
```json
{
  "success": false,
  "message": "Access token is missing or invalid"
}
```

### Forbidden Error (403)
```json
{
  "success": false,
  "message": "You can only update your own profile"
}
```

### Duplicate Error (400)
```json
{
  "success": false,
  "message": "Roll number already exists"
}
```

## Usage Examples

### Using cURL

**Get all students**:
```bash
curl -X GET "http://localhost:3000/api/students" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create a student**:
```bash
curl -X POST "http://localhost:3000/api/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userData": {
      "name": "Bob Johnson",
      "email": "bob.johnson@student.edu",
      "password": "securePassword123"
    },
    "studentData": {
      "rollNumber": "STU003",
      "departmentId": 2,
      "courseId": 2,
      "semester": 1,
      "admissionYear": 2023,
      "guardianName": "Bob Johnson Sr.",
      "guardianPhone": "+1234567893",
      "address": "789 Pine St"
    }
  }'
```

**Update a student**:
```bash
curl -X PUT "http://localhost:3000/api/students/2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "studentData": {
      "semester": 2
    }
  }'
```

**Delete a student**:
```bash
curl -X DELETE "http://localhost:3000/api/students/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get attendance summary**:
```bash
curl -X GET "http://localhost:3000/api/students/1/attendance-summary?startDate=2023-08-01&endDate=2023-08-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get payment history**:
```bash
curl -X GET "http://localhost:3000/api/students/1/payment-history?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

**Get all students**:
```javascript
const response = await fetch('/api/students', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data.students);
```

**Create a student**:
```javascript
const response = await fetch('/api/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userData: {
      name: 'Alice Brown',
      email: 'alice.brown@student.edu',
      password: 'securePassword123'
    },
    studentData: {
      rollNumber: 'STU004',
      departmentId: 3,
      courseId: 3,
      semester: 1,
      admissionYear: 2023,
      guardianName: 'Alice Brown Sr.',
      guardianPhone: '+1234567894',
      address: '321 Elm St'
    }
  })
});
const data = await response.json();
```

**Update a student**:
```javascript
const response = await fetch('/api/students/2', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    studentData: {
      semester: 3
    }
  })
});
const data = await response.json();
```

## Database Schema

The Student model includes the following fields:
- `id`: Primary key (auto-increment)
- `rollNumber`: Unique roll number (max 20 characters)
- `semester`: Current semester (1-8)
- `admissionYear`: Year of admission
- `guardianName`: Guardian's name (max 100 characters)
- `guardianPhone`: Guardian's phone (max 15 characters)
- `address`: Student's address (text)
- `userId`: Foreign key to User table
- `departmentId`: Foreign key to Department table
- `courseId`: Foreign key to Course table
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## Relationships

- **User**: Each student has one associated user account
- **Department**: Students belong to one department
- **Course**: Students are enrolled in one course
- **Attendance**: Students can have multiple attendance records
- **Marks**: Students can have multiple mark records
- **StudentPayment**: Students can have multiple payment records

## Business Rules

1. **Unique Constraints**: Roll numbers and emails must be unique
2. **Self-Update**: Students can only update their own profiles (unless admin)
3. **Deletion Constraints**: Students cannot be deleted if they have:
   - Attendance records
   - Mark records
   - Payment records
4. **Password Security**: Passwords are hashed using bcrypt
5. **Role Assignment**: All students automatically get 'student' role
6. **Semester Validation**: Semester must be between 1-8
7. **Admission Year**: Must be between 2000 and current year

## Notes

1. **Roll Number Uniqueness**: Roll numbers must be unique across the system
2. **Email Uniqueness**: Email addresses must be unique across all users
3. **Department/Course Assignment**: All students must be assigned to valid department and course
4. **Self-Service**: Students can update their own profiles for basic information
5. **Admin Override**: Admins can update any student's information
6. **Cascade Deletion**: Deleting a student also deletes their user account
7. **Validation**: All input is validated using Joi schemas
8. **Attendance Tracking**: Students can view their attendance summary
9. **Payment History**: Students can view their payment history
10. **Dependency Protection**: Students with academic records cannot be deleted
