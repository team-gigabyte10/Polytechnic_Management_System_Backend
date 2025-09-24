# Course API Documentation

This document describes the Course API endpoints for the Polytechnic Management System.

## Base URL
```
/api/courses
```

## Authentication
- **Public endpoints**: No authentication required
- **Protected endpoints**: JWT token required in Authorization header
- **Admin-only endpoints**: Only users with 'admin' role can access

## Endpoints

### 1. Get All Courses
**GET** `/api/courses`

**Description**: Retrieve all courses with optional filtering and pagination

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `department` (optional): Filter by department ID
- `search` (optional): Search in course name or code

**Response**:
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "name": "Computer Science Engineering",
        "code": "CSE",
        "departmentId": 1,
        "durationYears": 3,
        "department": {
          "name": "Computer Science",
          "code": "CS"
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

### 2. Get Course by ID
**GET** `/api/courses/:id`

**Description**: Retrieve a specific course by its ID

**Path Parameters**:
- `id`: Course ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Computer Science Engineering",
    "code": "CSE",
    "departmentId": 1,
    "durationYears": 3,
    "department": {
      "id": 1,
      "name": "Computer Science",
      "code": "CS"
    },
    "students": [
      {
        "id": 1,
        "rollNumber": "2023001",
        "semester": 3,
        "admissionYear": 2023,
        "user": {
          "name": "John Doe",
          "email": "john@example.com",
          "isActive": true
        }
      }
    ],
    "subjects": [
      {
        "id": 1,
        "name": "Data Structures",
        "code": "DS101",
        "credits": 3
      }
    ]
  }
}
```

### 3. Get Courses by Department
**GET** `/api/courses/department/:departmentId`

**Description**: Retrieve all courses for a specific department

**Path Parameters**:
- `departmentId`: Department ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Computer Science Engineering",
      "code": "CSE",
      "departmentId": 1,
      "durationYears": 3,
      "department": {
        "name": "Computer Science",
        "code": "CS"
      }
    }
  ]
}
```

### 4. Create Course
**POST** `/api/courses`

**Description**: Create a new course (Admin/Teacher only)

**Authentication**: Required (JWT token)

**Authorization**: Admin or Teacher role

**Request Body**:
```json
{
  "name": "Computer Science Engineering",
  "code": "CSE",
  "departmentId": 1,
  "durationYears": 3
}
```

**Validation Rules**:
- `name`: Required, 2-150 characters
- `code`: Required, 2-20 characters, must be unique
- `departmentId`: Required, must be a valid department ID
- `durationYears`: Optional, 1-10 years (default: 3)

**Response**:
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 1,
    "name": "Computer Science Engineering",
    "code": "CSE",
    "departmentId": 1,
    "durationYears": 3,
    "department": {
      "name": "Computer Science",
      "code": "CS"
    }
  }
}
```

### 5. Update Course
**PUT** `/api/courses/:id`

**Description**: Update an existing course (Admin/Teacher only)

**Authentication**: Required (JWT token)

**Authorization**: Admin or Teacher role

**Path Parameters**:
- `id`: Course ID

**Request Body**:
```json
{
  "name": "Computer Science & Engineering",
  "durationYears": 4
}
```

**Validation Rules**:
- All fields are optional
- `code`: If provided, must be unique (excluding current course)
- `departmentId`: If provided, must be a valid department ID

**Response**:
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": 1,
    "name": "Computer Science & Engineering",
    "code": "CSE",
    "departmentId": 1,
    "durationYears": 4,
    "department": {
      "name": "Computer Science",
      "code": "CS"
    }
  }
}
```

### 6. Delete Course
**DELETE** `/api/courses/:id`

**Description**: Delete a course (Admin only)

**Authentication**: Required (JWT token)

**Authorization**: Admin role only

**Path Parameters**:
- `id`: Course ID

**Business Rules**:
- Cannot delete if students are enrolled
- Cannot delete if subjects are assigned

**Response**:
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Error Response** (if course has dependencies):
```json
{
  "success": false,
  "message": "Cannot delete course. 15 student(s) are enrolled in this course."
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
  "success": false,
  "message": "Course not found"
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

### Duplicate Code Error (400)
```json
{
  "success": false,
  "message": "Course code already exists"
}
```

## Usage Examples

### Using cURL

**Get all courses**:
```bash
curl -X GET "http://localhost:3000/api/courses"
```

**Create a course**:
```bash
curl -X POST "http://localhost:3000/api/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Electrical Engineering",
    "code": "EE",
    "departmentId": 2,
    "durationYears": 4
  }'
```

**Update a course**:
```bash
curl -X PUT "http://localhost:3000/api/courses/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "durationYears": 4
  }'
```

**Delete a course**:
```bash
curl -X DELETE "http://localhost:3000/api/courses/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

**Get all courses**:
```javascript
const response = await fetch('/api/courses');
const data = await response.json();
console.log(data.courses);
```

**Create a course**:
```javascript
const response = await fetch('/api/courses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Mechanical Engineering',
    code: 'ME',
    departmentId: 3,
    durationYears: 4
  })
});
const data = await response.json();
```

## Notes

1. **Course Code Uniqueness**: Course codes must be unique across the system
2. **Department Validation**: All courses must be associated with a valid department
3. **Deletion Constraints**: Courses cannot be deleted if they have enrolled students or assigned subjects
4. **Pagination**: The API supports pagination for better performance with large datasets
5. **Search**: Search functionality works on both course name and code fields
6. **Associations**: The API returns related data (department, students, subjects) when appropriate

## Database Schema

The Course model includes the following fields:
- `id`: Primary key (auto-increment)
- `name`: Course name (max 150 characters)
- `code`: Unique course code (max 20 characters)
- `departmentId`: Foreign key to Department table
- `durationYears`: Course duration in years (default: 3)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update
