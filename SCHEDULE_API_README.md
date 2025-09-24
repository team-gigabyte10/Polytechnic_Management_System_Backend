# Class Schedule API Documentation

## Overview
The Class Schedule API provides comprehensive functionality for managing class schedules in the Polytechnic Management System. It supports creating, reading, updating, and deleting class schedules with advanced filtering and search capabilities.

## Base URL
```
http://localhost:3000/api/class-schedules
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Test Endpoint
**GET** `/test`
- **Description**: Test endpoint to verify API functionality
- **Authentication**: None required
- **Response**: 
```json
{
  "success": true,
  "message": "Class Schedule API is working",
  "data": {
    "timestamp": "2025-09-03T09:08:05.399Z",
    "endpoint": "/api/class-schedules/test",
    "totalSchedules": 0,
    "modelAccess": "OK"
  }
}
```

### 2. Get All Class Schedules
**GET** `/`
- **Description**: Retrieve all class schedules with filtering and pagination
- **Authentication**: Admin, Teacher
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `department` (optional): Filter by department ID
  - `subject` (optional): Filter by subject ID
  - `teacher` (optional): Filter by teacher ID
  - `day` (optional): Filter by day (monday, tuesday, etc.)
  - `classType` (optional): Filter by class type (theory, practical, lab, tutorial, seminar)
  - `semester` (optional): Filter by semester (1-8)
  - `academicYear` (optional): Filter by academic year
  - `isActive` (optional): Filter by active status (default: true)

**Example Request**:
```
GET /api/class-schedules?page=1&limit=10&day=monday&semester=1&isActive=true
```

**Response**:
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 1,
        "subjectId": 1,
        "teacherId": 1,
        "roomNumber": "A101",
        "scheduleDay": "monday",
        "startTime": "09:00:00",
        "endTime": "10:30:00",
        "classType": "theory",
        "semester": 1,
        "academicYear": "2024-25",
        "maxStudents": 30,
        "isRecurring": true,
        "startDate": "2024-09-01",
        "endDate": "2024-12-31",
        "notes": "Mathematics class",
        "isActive": true,
        "subject": {
          "id": 1,
          "name": "Mathematics",
          "code": "MATH101",
          "credits": 3,
          "department": {
            "id": 1,
            "name": "Computer Science",
            "code": "CS"
          }
        },
        "teacher": {
          "id": 1,
          "employeeId": "T001",
          "user": {
            "name": "Dr. John Smith"
          }
        }
      }
    ],
    "pagination": {
      "total": 1,
      "pages": 1,
      "currentPage": 1,
      "perPage": 10
    }
  }
}
```

### 3. Get Weekly Schedule
**GET** `/weekly-schedule`
- **Description**: Get weekly schedule for a specific department and semester
- **Authentication**: Admin, Teacher, Student
- **Query Parameters**:
  - `department` (optional): Department ID
  - `semester` (optional): Semester number
  - `academicYear` (optional): Academic year

**Response**:
```json
{
  "success": true,
  "data": {
    "weeklySchedule": {
      "monday": [...],
      "tuesday": [...],
      "wednesday": [...],
      "thursday": [...],
      "friday": [...],
      "saturday": [...],
      "sunday": [...]
    }
  }
}
```

### 4. Get Class Schedule by ID
**GET** `/:id`
- **Description**: Get a specific class schedule by ID
- **Authentication**: Admin, Teacher, Student
- **Path Parameters**:
  - `id`: Class schedule ID

**Response**:
```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": 1,
      "subjectId": 1,
      "teacherId": 1,
      "roomNumber": "A101",
      "scheduleDay": "monday",
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "classType": "theory",
      "semester": 1,
      "academicYear": "2024-25",
      "maxStudents": 30,
      "isRecurring": true,
      "startDate": "2024-09-01",
      "endDate": "2024-12-31",
      "notes": "Mathematics class",
      "isActive": true,
      "subject": {...},
      "teacher": {...}
    }
  }
}
```

### 5. Create Class Schedule
**POST** `/`
- **Description**: Create a new class schedule
- **Authentication**: Admin only
- **Request Body**:
```json
{
  "subjectId": 1,
  "teacherId": 1,
  "roomNumber": "A101",
  "scheduleDay": "monday",
  "startTime": "09:00",
  "endTime": "10:30",
  "classType": "theory",
  "semester": 1,
  "academicYear": "2024-25",
  "maxStudents": 30,
  "isRecurring": true,
  "startDate": "2024-09-01",
  "endDate": "2024-12-31",
  "notes": "Mathematics class",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Class schedule created successfully",
  "data": {
    "schedule": {
      "id": 1,
      "subjectId": 1,
      "teacherId": 1,
      "roomNumber": "A101",
      "scheduleDay": "monday",
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "classType": "theory",
      "semester": 1,
      "academicYear": "2024-25",
      "maxStudents": 30,
      "isRecurring": true,
      "startDate": "2024-09-01",
      "endDate": "2024-12-31",
      "notes": "Mathematics class",
      "isActive": true
    }
  }
}
```

### 6. Update Class Schedule
**PUT** `/:id`
- **Description**: Update an existing class schedule
- **Authentication**: Admin only
- **Path Parameters**:
  - `id`: Class schedule ID
- **Request Body**: Same as create, but all fields are optional

**Response**:
```json
{
  "success": true,
  "message": "Class schedule updated successfully",
  "data": {
    "schedule": {...}
  }
}
```

### 7. Delete Class Schedule
**DELETE** `/:id`
- **Description**: Delete a class schedule
- **Authentication**: Admin only
- **Path Parameters**:
  - `id`: Class schedule ID

**Response**:
```json
{
  "success": true,
  "message": "Class schedule deleted successfully"
}
```

### 8. Get Schedules by Academic Period
**GET** `/academic-period/:academicYear/:semester`
- **Description**: Get class schedules for a specific academic year and semester
- **Authentication**: Admin, Teacher, Student
- **Path Parameters**:
  - `academicYear`: Academic year (e.g., "2024-25")
  - `semester`: Semester number (1-8)

### 9. Get Schedules by Teacher
**GET** `/teacher/:teacherId`
- **Description**: Get all schedules for a specific teacher
- **Authentication**: Admin, Teacher
- **Path Parameters**:
  - `teacherId`: Teacher ID

### 10. Get Schedules by Guest Teacher
**GET** `/guest-teacher/:guestTeacherId`
- **Description**: Get all schedules for a specific guest teacher
- **Authentication**: Admin, Teacher
- **Path Parameters**:
  - `guestTeacherId`: Guest teacher ID

### 11. Get Schedules by Subject
**GET** `/subject/:subjectId`
- **Description**: Get all schedules for a specific subject
- **Authentication**: Admin, Teacher, Student
- **Path Parameters**:
  - `subjectId`: Subject ID

### 12. Get Schedules by Room
**GET** `/room/:roomNumber`
- **Description**: Get all schedules for a specific room
- **Authentication**: Admin, Teacher, Student
- **Path Parameters**:
  - `roomNumber`: Room number

## Data Models

### ClassSchedule
```json
{
  "id": "integer (auto-increment)",
  "subjectId": "integer (required)",
  "teacherId": "integer (optional)",
  "guestTeacherId": "integer (optional)",
  "roomNumber": "string(20) (optional)",
  "scheduleDay": "enum (required) - monday, tuesday, wednesday, thursday, friday, saturday, sunday",
  "startTime": "time (required)",
  "endTime": "time (required)",
  "classType": "enum (default: theory) - theory, practical, lab, tutorial, seminar",
  "semester": "integer (required, 1-8)",
  "academicYear": "string(10) (required)",
  "maxStudents": "integer (default: 30)",
  "isRecurring": "boolean (default: true)",
  "startDate": "date (optional)",
  "endDate": "date (optional)",
  "notes": "text (optional)",
  "isActive": "boolean (default: true)",
  "createdBy": "integer (optional)",
  "updatedBy": "integer (optional)"
}
```

## Validation Rules

1. **Teacher Assignment**: Either `teacherId` or `guestTeacherId` must be provided, but not both
2. **Time Validation**: `endTime` must be after `startTime`
3. **Date Validation**: `endDate` must be after `startDate` (if both provided)
4. **Semester Range**: Semester must be between 1 and 8
5. **Day Validation**: Schedule day must be a valid day of the week

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "startTime",
      "message": "\"startTime\" is required"
    }
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Class schedule not found"
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

## Usage Examples

### Create a Weekly Schedule
```bash
# Monday Math Class
curl -X POST "http://localhost:3000/api/class-schedules" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": 1,
    "teacherId": 1,
    "roomNumber": "A101",
    "scheduleDay": "monday",
    "startTime": "09:00",
    "endTime": "10:30",
    "classType": "theory",
    "semester": 1,
    "academicYear": "2024-25"
  }'

# Tuesday Lab Session
curl -X POST "http://localhost:3000/api/class-schedules" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": 2,
    "teacherId": 1,
    "roomNumber": "LAB01",
    "scheduleDay": "tuesday",
    "startTime": "14:00",
    "endTime": "16:00",
    "classType": "lab",
    "semester": 1,
    "academicYear": "2024-25"
  }'
```

### Get Weekly Schedule
```bash
curl -X GET "http://localhost:3000/api/class-schedules/weekly-schedule?department=1&semester=1" \
  -H "Authorization: Bearer <token>"
```

### Filter Schedules
```bash
# Get all Monday classes
curl -X GET "http://localhost:3000/api/class-schedules?day=monday" \
  -H "Authorization: Bearer <token>"

# Get all lab sessions
curl -X GET "http://localhost:3000/api/class-schedules?classType=lab" \
  -H "Authorization: Bearer <token>"

# Get schedules for specific teacher
curl -X GET "http://localhost:3000/api/class-schedules/teacher/1" \
  -H "Authorization: Bearer <token>"
```

## Notes

1. **Time Format**: Use 24-hour format (HH:MM) for time fields
2. **Date Format**: Use YYYY-MM-DD format for date fields
3. **Academic Year**: Use format like "2024-25" for academic year
4. **Room Conflicts**: The API doesn't automatically check for room conflicts - implement this in your frontend
5. **Teacher Conflicts**: The API doesn't automatically check for teacher time conflicts - implement this in your frontend
6. **Recurring Schedules**: Use `isRecurring` flag to indicate if the schedule repeats weekly
7. **Active Status**: Use `isActive` to enable/disable schedules without deleting them

## Integration with Other APIs

- **Subjects API**: Links to subjects via `subjectId`
- **Teachers API**: Links to teachers via `teacherId`
- **Guest Teachers API**: Links to guest teachers via `guestTeacherId`
- **Departments API**: Links to departments through subjects
- **Attendance API**: Can be used to track attendance for scheduled classes
