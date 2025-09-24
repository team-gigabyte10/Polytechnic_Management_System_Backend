# Teacher API Documentation

This document describes the Teacher API endpoints for the Polytechnic Management System.

## Base URL
```
/api/teachers
```

## Authentication
- **All endpoints**: JWT token required in Authorization header
- **Admin-only endpoints**: Only users with 'admin' role can access
- **Self-update endpoints**: Teachers can update their own profiles

## Endpoints

### 1. Get All Teachers
**GET** `/api/teachers`

**Description**: Retrieve all teachers with optional filtering and pagination

**Authentication**: Required (JWT token)

**Authorization**: Admin or Teacher role

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `department` (optional): Filter by department ID

**Response**:
```json
{
  "success": true,
  "data": {
    "teachers": [
      {
        "id": 1,
        "employeeId": "T001",
        "qualification": "Ph.D. Computer Science",
        "phone": "+1234567890",
        "address": "123 Main St",
        "userId": 1,
        "departmentId": 1,
        "user": {
          "name": "Dr. John Doe",
          "email": "john.doe@polytechnic.edu",
          "isActive": true
        },
        "department": {
          "name": "Computer Science",
          "code": "CSE"
        }
      }
    ],
    "pagination": {
      "total": 10,
      "pages": 1,
      "currentPage": 1,
      "perPage": 10
    }
  }
}
```

### 2. Get Teacher by ID
**GET** `/api/teachers/:id`

**Description**: Retrieve a specific teacher by their ID

**Authentication**: Required (JWT token)

**Path Parameters**:
- `id`: Teacher ID

**Response**:
```json
{
  "success": true,
  "data": {
    "teacher": {
      "id": 1,
      "employeeId": "T001",
      "qualification": "Ph.D. Computer Science",
      "phone": "+1234567890",
      "address": "123 Main St",
      "userId": 1,
      "departmentId": 1,
      "user": {
        "name": "Dr. John Doe",
        "email": "john.doe@polytechnic.edu",
        "isActive": true,
        "createdAt": "2023-01-15T10:00:00.000Z"
      },
      "department": {
        "id": 1,
        "name": "Computer Science",
        "code": "CSE"
      },
      "classes": [
        {
          "id": 1,
          "name": "Data Structures",
          "code": "CS201"
        }
      ],
      "salaries": [
        {
          "id": 1,
          "baseAmount": 50000,
          "month": 1,
          "year": 2023
        }
      ]
    }
  }
}
```

### 3. Create Teacher
**POST** `/api/teachers`

**Description**: Create a new teacher (Admin only)

**Authentication**: Required (JWT token)

**Authorization**: Admin role only

**Request Body**:
```json
{
  "userData": {
    "name": "Dr. Jane Smith",
    "email": "jane.smith@polytechnic.edu",
    "password": "securePassword123"
  },
  "teacherData": {
    "employeeId": "T002",
    "qualification": "Ph.D. Mathematics",
    "phone": "+1234567891",
    "address": "456 Oak Ave",
    "departmentId": 2,
    "salary": 50000
  }
}
```

**Request Body (without salary)**:
```json
{
  "userData": {
    "name": "Dr. Jane Smith",
    "email": "jane.smith@polytechnic.edu",
    "password": "securePassword123"
  },
  "teacherData": {
    "employeeId": "T002",
    "qualification": "Ph.D. Mathematics",
    "phone": "+1234567891",
    "address": "456 Oak Ave",
    "departmentId": 2
  }
}
```

**Validation Rules**:
- `userData.name`: Required, 2-100 characters
- `userData.email`: Required, valid email format, must be unique
- `userData.password`: Required, 6-50 characters
- `teacherData.employeeId`: Required, 1-20 characters, must be unique
- `teacherData.departmentId`: Required, must be a valid department ID
- `teacherData.salary`: Optional, positive number (defaults to 0.00 if not provided)

**Response**:
```json
{
  "success": true,
  "message": "Teacher created successfully",
  "data": {
    "teacher": {
      "id": 2,
      "employeeId": "T002",
      "qualification": "Ph.D. Mathematics",
      "phone": "+1234567891",
      "address": "456 Oak Ave",
      "userId": 2,
      "departmentId": 2,
      "user": {
        "name": "Dr. Jane Smith",
        "email": "jane.smith@polytechnic.edu",
        "role": "teacher"
      },
      "department": {
        "name": "Mathematics",
        "code": "MATH"
      }
    }
  }
}
```

### 4. Update Teacher
**PUT** `/api/teachers/:id`

**Description**: Update an existing teacher (Admin or Teacher themselves)

**Authentication**: Required (JWT token)

**Authorization**: Admin role or Teacher updating their own profile

**Path Parameters**:
- `id`: Teacher ID

**Request Body**:
```json
{
  "userData": {
    "name": "Dr. Jane Smith-Updated",
    "email": "jane.updated@polytechnic.edu"
  },
  "teacherData": {
    "qualification": "Ph.D. Applied Mathematics",
    "phone": "+1234567892"
  }
}
```

**Validation Rules**:
- All fields are optional
- `userData.email`: If provided, must be unique (excluding current user)
- `teacherData.employeeId`: If provided, must be unique (excluding current teacher)

**Response**:
```json
{
  "success": true,
  "message": "Teacher updated successfully",
  "data": {
    "teacher": {
      "id": 2,
      "employeeId": "T002",
      "qualification": "Ph.D. Applied Mathematics",
      "phone": "+1234567892",
      "address": "456 Oak Ave",
      "userId": 2,
      "departmentId": 2,
      "user": {
        "name": "Dr. Jane Smith-Updated",
        "email": "jane.updated@polytechnic.edu",
        "role": "teacher",
        "isActive": true
      },
      "department": {
        "name": "Mathematics",
        "code": "MATH"
      }
    }
  }
}
```

### 5. Delete Teacher
**DELETE** `/api/teachers/:id`

**Description**: Delete a teacher (Admin only)

**Authentication**: Required (JWT token)

**Authorization**: Admin role only

**Path Parameters**:
- `id`: Teacher ID

**Business Rules**:
- Cannot delete if teacher has classes assigned
- Cannot delete if teacher is a department head

**Response**:
```json
{
  "success": true,
  "message": "Teacher deleted successfully"
}
```

**Error Response** (if teacher has dependencies):
```json
{
  "success": false,
  "message": "Cannot delete teacher. 5 class(es) are assigned to this teacher."
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
  "message": "Teacher not found"
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
  "message": "Employee ID already exists"
}
```

## Usage Examples

### Using cURL

**Get all teachers**:
```bash
curl -X GET "http://localhost:3000/api/teachers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create a teacher (with salary)**:
```bash
curl -X POST "http://localhost:3000/api/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userData": {
      "name": "Dr. Bob Johnson",
      "email": "bob.johnson@polytechnic.edu",
      "password": "securePassword123"
    },
    "teacherData": {
      "employeeId": "T003",
      "qualification": "Ph.D. Physics",
      "phone": "+1234567893",
      "address": "789 Pine St",
      "departmentId": 3,
      "salary": 55000
    }
  }'
```

**Create a teacher (without salary)**:
```bash
curl -X POST "http://localhost:3000/api/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userData": {
      "name": "Dr. Bob Johnson",
      "email": "bob.johnson@polytechnic.edu",
      "password": "securePassword123"
    },
    "teacherData": {
      "employeeId": "T003",
      "qualification": "Ph.D. Physics",
      "phone": "+1234567893",
      "address": "789 Pine St",
      "departmentId": 3
    }
  }'
```

**Update a teacher**:
```bash
curl -X PUT "http://localhost:3000/api/teachers/2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "teacherData": {
      "qualification": "Ph.D. Advanced Mathematics"
    }
  }'
```

**Delete a teacher**:
```bash
curl -X DELETE "http://localhost:3000/api/teachers/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

**Get all teachers**:
```javascript
const response = await fetch('/api/teachers', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data.teachers);
```

**Create a teacher (with salary)**:
```javascript
const response = await fetch('/api/teachers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userData: {
      name: 'Dr. Alice Brown',
      email: 'alice.brown@polytechnic.edu',
      password: 'securePassword123'
    },
    teacherData: {
      employeeId: 'T004',
      qualification: 'Ph.D. Chemistry',
      phone: '+1234567894',
      address: '321 Elm St',
      departmentId: 4,
      salary: 60000
    }
  })
});
const data = await response.json();
```

**Create a teacher (without salary)**:
```javascript
const response = await fetch('/api/teachers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userData: {
      name: 'Dr. Alice Brown',
      email: 'alice.brown@polytechnic.edu',
      password: 'securePassword123'
    },
    teacherData: {
      employeeId: 'T004',
      qualification: 'Ph.D. Chemistry',
      phone: '+1234567894',
      address: '321 Elm St',
      departmentId: 4
    }
  })
});
const data = await response.json();
```

## Database Schema

The Teacher model includes the following fields:
- `id`: Primary key (auto-increment)
- `employeeId`: Unique employee ID (max 20 characters)
- `qualification`: Teacher's qualification (max 200 characters)
- `phone`: Phone number (max 15 characters)
- `address`: Address (text)
- `userId`: Foreign key to User table
- `departmentId`: Foreign key to Department table
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## Relationships

- **User**: Each teacher has one associated user account
- **Department**: Teachers belong to one department
- **Classes**: Teachers can teach multiple classes
- **Salaries**: Teachers can have multiple salary records
- **Department Head**: Teachers can be heads of departments

## Business Rules

1. **Unique Constraints**: Employee IDs and emails must be unique
2. **Self-Update**: Teachers can only update their own profiles (unless admin)
3. **Deletion Constraints**: Teachers cannot be deleted if they have:
   - Assigned classes
   - Department head responsibilities
4. **Password Security**: Passwords are hashed using bcrypt
5. **Role Assignment**: All teachers automatically get 'teacher' role

## Notes

1. **Employee ID Uniqueness**: Employee IDs must be unique across the system
2. **Email Uniqueness**: Email addresses must be unique across all users
3. **Department Assignment**: All teachers must be assigned to a valid department
4. **Self-Service**: Teachers can update their own profiles for basic information
5. **Admin Override**: Admins can update any teacher's information
6. **Cascade Deletion**: Deleting a teacher also deletes their user account
7. **Validation**: All input is validated using Joi schemas
