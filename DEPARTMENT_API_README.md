# Department API Documentation

This document describes the Department API endpoints for the Polytechnic Management System.

## Base URL
```
/api/departments
```

## Authentication
- **Public endpoints**: No authentication required
- **Protected endpoints**: JWT token required in Authorization header
- **Admin-only endpoints**: Only users with 'admin' role can access

## Endpoints

### 1. Get All Departments
**GET** `/api/departments`

**Description**: Retrieve all departments with optional filtering and pagination

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search in department name or code

**Response**:
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": 1,
        "name": "Computer Science",
        "code": "CSE",
        "headId": 1,
        "head": {
          "id": 1,
          "employeeId": "T001",
          "user": {
            "name": "Dr. John Doe",
            "email": "john.doe@polytechnic.edu"
          }
        }
      }
    ],
    "pagination": {
      "total": 5,
      "pages": 1,
      "currentPage": 1,
      "perPage": 10
    }
  }
}
```

### 2. Get Department by ID
**GET** `/api/departments/:id`

**Description**: Retrieve a specific department by its ID with detailed information

**Path Parameters**:
- `id`: Department ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Computer Science",
    "code": "CSE",
    "headId": 1,
    "head": {
      "id": 1,
      "employeeId": "T001",
      "user": {
        "name": "Dr. John Doe",
        "email": "john.doe@polytechnic.edu",
        "isActive": true
      }
    },
    "courses": [
      {
        "id": 1,
        "name": "Computer Science Engineering",
        "code": "CSE-3Y",
        "durationYears": 3
      }
    ],
    "students": [
      {
        "id": 1,
        "rollNumber": "2023001",
        "semester": 3,
        "user": {
          "name": "Alice Smith",
          "email": "alice.smith@student.edu",
          "isActive": true
        }
      }
    ],
    "teachers": [
      {
        "id": 1,
        "employeeId": "T001",
        "qualification": "Ph.D. Computer Science",
        "user": {
          "name": "Dr. John Doe",
          "email": "john.doe@polytechnic.edu",
          "isActive": true
        }
      }
    ]
  }
}
```

### 3. Get Department Statistics
**GET** `/api/departments/:id/stats`

**Description**: Get statistics for a specific department

**Path Parameters**:
- `id`: Department ID

**Response**:
```json
{
  "success": true,
  "data": {
    "department": {
      "id": 1,
      "name": "Computer Science",
      "code": "CSE"
    },
    "statistics": {
      "courses": 5,
      "students": 120,
      "teachers": 15
    }
  }
}
```

### 4. Create Department
**POST** `/api/departments`

**Description**: Create a new department (Admin/Teacher only)

**Authentication**: Required (JWT token)

**Authorization**: Admin or Teacher role

**Request Body**:
```json
{
  "name": "Electrical Engineering",
  "code": "EE",
  "headId": 2
}
```

**Validation Rules**:
- `name`: Required, 2-100 characters, must be unique
- `code`: Required, 1-10 characters, must be unique
- `headId`: Optional, must be a valid teacher ID

**Response**:
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 2,
    "name": "Electrical Engineering",
    "code": "EE",
    "headId": 2,
    "head": {
      "id": 2,
      "employeeId": "T002",
      "user": {
        "name": "Dr. Jane Smith",
        "email": "jane.smith@polytechnic.edu"
      }
    }
  }
}
```

### 5. Update Department
**PUT** `/api/departments/:id`

**Description**: Update an existing department (Admin/Teacher only)

**Authentication**: Required (JWT token)

**Authorization**: Admin or Teacher role

**Path Parameters**:
- `id`: Department ID

**Request Body**:
```json
{
  "name": "Electrical & Electronics Engineering",
  "headId": 3
}
```

**Validation Rules**:
- All fields are optional
- `name`: If provided, must be unique (excluding current department)
- `code`: If provided, must be unique (excluding current department)
- `headId`: If provided, must be a valid teacher ID or null

**Response**:
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "id": 2,
    "name": "Electrical & Electronics Engineering",
    "code": "EE",
    "headId": 3,
    "head": {
      "id": 3,
      "employeeId": "T003",
      "user": {
        "name": "Dr. Bob Johnson",
        "email": "bob.johnson@polytechnic.edu"
      }
    }
  }
}
```

### 6. Delete Department
**DELETE** `/api/departments/:id`

**Description**: Delete a department (Admin only)

**Authentication**: Required (JWT token)

**Authorization**: Admin role only

**Path Parameters**:
- `id`: Department ID

**Business Rules**:
- Cannot delete if courses are assigned
- Cannot delete if students are enrolled
- Cannot delete if teachers are assigned

**Response**:
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

**Error Response** (if department has dependencies):
```json
{
  "success": false,
  "message": "Cannot delete department. 5 course(s) are assigned to this department."
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
      "field": "name",
      "message": "\"name\" is required"
    }
  ]
}
```

### Not Found Error (404)
```json
{
  "success": false",
  "message": "Department not found"
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
  "message": "Insufficient permissions"
}
```

### Duplicate Name/Code Error (400)
```json
{
  "success": false,
  "message": "Department name already exists"
}
```

## Usage Examples

### Using cURL

**Get all departments**:
```bash
curl -X GET "http://localhost:3000/api/departments"
```

**Create a department**:
```bash
curl -X POST "http://localhost:3000/api/departments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Mechanical Engineering",
    "code": "ME",
    "headId": 4
  }'
```

**Update a department**:
```bash
curl -X PUT "http://localhost:3000/api/departments/2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Mechanical & Industrial Engineering"
  }'
```

**Delete a department**:
```bash
curl -X DELETE "http://localhost:3000/api/departments/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

**Get all departments**:
```javascript
const response = await fetch('/api/departments');
const data = await response.json();
console.log(data.departments);
```

**Create a department**:
```javascript
const response = await fetch('/api/departments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Civil Engineering',
    code: 'CE',
    headId: 5
  })
});
const data = await response.json();
```

## Database Schema

The Department model includes the following fields:
- `id`: Primary key (auto-increment)
- `name`: Department name (max 100 characters, unique)
- `code`: Department code (max 10 characters, unique)
- `headId`: Foreign key to Teacher table (optional)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## Relationships

- **Head Teacher**: Each department can have one head teacher
- **Courses**: Departments can have multiple courses
- **Students**: Departments can have multiple enrolled students
- **Teachers**: Departments can have multiple assigned teachers
- **Announcements**: Departments can have multiple announcements
- **Expenses**: Departments can have multiple expenses

## Business Rules

1. **Unique Constraints**: Department names and codes must be unique
2. **Head Teacher Validation**: If headId is provided, it must reference a valid teacher
3. **Deletion Constraints**: Departments cannot be deleted if they have:
   - Assigned courses
   - Enrolled students
   - Assigned teachers
4. **Cascade Updates**: When a department is updated, related entities are updated accordingly

## Notes

1. **Department Code Uniqueness**: Department codes must be unique across the system
2. **Head Teacher Assignment**: Departments can optionally have a head teacher for administrative purposes
3. **Deletion Constraints**: Departments cannot be deleted if they have dependencies
4. **Pagination**: The API supports pagination for better performance with large datasets
5. **Search**: Search functionality works on both department name and code fields
6. **Associations**: The API returns related data (head teacher, courses, students, teachers) when appropriate
