# Class Schedule API Documentation

This document provides comprehensive documentation for the Class Schedule API endpoints in the Polytechnic Management System.

## Base URL
```
/api/class-schedules
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints Overview

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | `/` | Get all class schedules with filtering | Admin, Teacher |
| GET | `/weekly-schedule` | Get weekly schedule view | Admin, Teacher, Student |
| GET | `/academic-period/:academicYear/:semester` | Get schedules by academic period | Admin, Teacher, Student |
| GET | `/:id` | Get specific class schedule | Admin, Teacher, Student |
| POST | `/` | Create new class schedule | Admin only |
| PUT | `/:id` | Update class schedule | Admin only |
| DELETE | `/:id` | Delete class schedule | Admin only |
| GET | `/teacher/:teacherId` | Get schedules by teacher | Admin, Teacher |
| GET | `/guest-teacher/:guestTeacherId` | Get schedules by guest teacher | Admin, Teacher |
| GET | `/subject/:subjectId` | Get schedules by subject | Admin, Teacher, Student |
| GET | `/room/:roomNumber` | Get schedules by room | Admin, Teacher, Student |

---

## 1. Get All Class Schedules

**Endpoint:** `GET /api/class-schedules`

**Access:** Admin, Teacher

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `department` (optional): Filter by department ID
- `subject` (optional): Filter by subject ID
- `teacher` (optional): Filter by teacher ID
- `day` (optional): Filter by day (monday, tuesday, etc.)
- `classType` (optional): Filter by class type (theory, practical, lab, tutorial, seminar)
- `semester` (optional): Filter by semester (1-8)
- `academicYear` (optional): Filter by academic year
- `isActive` (optional): Filter by active status (default: true)

**Example Request:**
```bash
GET /api/class-schedules?page=1&limit=10&semester=3&academicYear=2024-25
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "classSchedules": [
      {
        "id": 1,
        "subjectId": 5,
        "teacherId": 3,
        "guestTeacherId": null,
        "roomNumber": "A101",
        "scheduleDay": "monday",
        "startTime": "09:00:00",
        "endTime": "10:30:00",
        "classType": "theory",
        "semester": 3,
        "academicYear": "2024-25",
        "maxStudents": 30,
        "isRecurring": true,
        "startDate": "2024-08-01",
        "endDate": "2024-12-15",
        "notes": "Advanced Programming Concepts",
        "isActive": true,
        "createdBy": 1,
        "updatedBy": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "subject": {
          "id": 5,
          "name": "Data Structures",
          "code": "CS301",
          "credits": 4,
          "theoryHours": 3,
          "practicalHours": 2,
          "course": {
            "id": 2,
            "name": "Computer Science Engineering",
            "code": "CSE",
            "department": {
              "id": 1,
              "name": "Computer Science",
              "code": "CS"
            }
          }
        },
        "teacher": {
          "id": 3,
          "employeeId": "EMP003",
          "designation": "Assistant Professor",
          "qualification": "M.Tech Computer Science",
          "user": {
            "name": "Dr. Sarah Johnson",
            "email": "sarah.johnson@polytechnic.edu"
          },
          "department": {
            "name": "Computer Science",
            "code": "CS"
          }
        },
        "creator": {
          "name": "Admin User",
          "email": "admin@polytechnic.edu"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "pages": 3,
      "currentPage": 1,
      "perPage": 10
    }
  }
}
```

---

## 2. Get Weekly Schedule

**Endpoint:** `GET /api/class-schedules/weekly-schedule`

**Access:** Admin, Teacher, Student

**Query Parameters:**
- `department` (optional): Filter by department ID
- `course` (optional): Filter by course ID
- `semester` (optional): Filter by semester
- `academicYear` (optional): Filter by academic year

**Example Request:**
```bash
GET /api/class-schedules/weekly-schedule?department=1&semester=3&academicYear=2024-25
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "weeklySchedule": {
      "monday": [
        {
          "id": 1,
          "subjectId": 5,
          "teacherId": 3,
          "roomNumber": "A101",
          "scheduleDay": "monday",
          "startTime": "09:00:00",
          "endTime": "10:30:00",
          "classType": "theory",
          "subject": {
            "name": "Data Structures",
            "code": "CS301",
            "course": {
              "name": "Computer Science Engineering",
              "department": {
                "name": "Computer Science"
              }
            }
          },
          "teacher": {
            "user": {
              "name": "Dr. Sarah Johnson"
            }
          }
        }
      ],
      "tuesday": [],
      "wednesday": [],
      "thursday": [],
      "friday": [],
      "saturday": [],
      "sunday": []
    }
  }
}
```

---

## 3. Get Class Schedules by Academic Period

**Endpoint:** `GET /api/class-schedules/academic-period/:academicYear/:semester`

**Access:** Admin, Teacher, Student

**Path Parameters:**
- `academicYear`: Academic year (e.g., "2024-25")
- `semester`: Semester number (1-8)

**Query Parameters:**
- `isActive` (optional): Filter by active status (default: true)
- `department` (optional): Filter by department ID
- `course` (optional): Filter by course ID

**Example Request:**
```bash
GET /api/class-schedules/academic-period/2024-25/3?department=1
```

---

## 4. Get Class Schedule by ID

**Endpoint:** `GET /api/class-schedules/:id`

**Access:** Admin, Teacher, Student

**Path Parameters:**
- `id`: Class schedule ID

**Example Request:**
```bash
GET /api/class-schedules/1
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "classSchedule": {
      "id": 1,
      "subjectId": 5,
      "teacherId": 3,
      "roomNumber": "A101",
      "scheduleDay": "monday",
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "classType": "theory",
      "semester": 3,
      "academicYear": "2024-25",
      "maxStudents": 30,
      "isRecurring": true,
      "startDate": "2024-08-01",
      "endDate": "2024-12-15",
      "notes": "Advanced Programming Concepts",
      "isActive": true,
      "subject": {
        "id": 5,
        "name": "Data Structures",
        "code": "CS301",
        "course": {
          "name": "Computer Science Engineering",
          "department": {
            "name": "Computer Science"
          }
        }
      },
      "teacher": {
        "id": 3,
        "employeeId": "EMP003",
        "user": {
          "name": "Dr. Sarah Johnson",
          "email": "sarah.johnson@polytechnic.edu"
        }
      },
      "attendances": [
        {
          "id": 1,
          "date": "2024-01-15",
          "status": "present",
          "student": {
            "id": 10,
            "rollNumber": "CS2024001",
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

---

## 5. Create Class Schedule

**Endpoint:** `POST /api/class-schedules`

**Access:** Admin only

**Request Body:**
```json
{
  "subjectId": 5,
  "teacherId": 3,
  "roomNumber": "A101",
  "scheduleDay": "monday",
  "startTime": "09:00",
  "endTime": "10:30",
  "classType": "theory",
  "semester": 3,
  "academicYear": "2024-25",
  "maxStudents": 30,
  "isRecurring": true,
  "startDate": "2024-08-01",
  "endDate": "2024-12-15",
  "notes": "Advanced Programming Concepts"
}
```

**Field Validation:**
- `subjectId`: Required, must be valid subject ID
- `teacherId` OR `guestTeacherId`: Exactly one must be provided
- `scheduleDay`: Required, must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday
- `startTime`: Required, format: HH:MM (24-hour)
- `endTime`: Required, format: HH:MM (24-hour), must be after startTime
- `classType`: Optional, must be one of: theory, practical, lab, tutorial, seminar (default: theory)
- `semester`: Required, integer between 1-8
- `academicYear`: Required, string max 10 characters
- `maxStudents`: Optional, integer 1-200 (default: 30)
- `isRecurring`: Optional, boolean (default: true)
- `startDate`: Optional, date format
- `endDate`: Optional, date format, must be after startDate
- `notes`: Optional, text field

**Example Response:**
```json
{
  "success": true,
  "message": "Class schedule created successfully",
  "data": {
    "classSchedule": {
      "id": 1,
      "subjectId": 5,
      "teacherId": 3,
      "roomNumber": "A101",
      "scheduleDay": "monday",
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "classType": "theory",
      "semester": 3,
      "academicYear": "2024-25",
      "maxStudents": 30,
      "isRecurring": true,
      "startDate": "2024-08-01",
      "endDate": "2024-12-15",
      "notes": "Advanced Programming Concepts",
      "isActive": true,
      "createdBy": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 6. Update Class Schedule

**Endpoint:** `PUT /api/class-schedules/:id`

**Access:** Admin only

**Path Parameters:**
- `id`: Class schedule ID

**Request Body:** (All fields optional)
```json
{
  "roomNumber": "A102",
  "startTime": "10:00",
  "endTime": "11:30",
  "maxStudents": 35,
  "notes": "Updated room and time"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Class schedule updated successfully",
  "data": {
    "classSchedule": {
      "id": 1,
      "roomNumber": "A102",
      "startTime": "10:00:00",
      "endTime": "11:30:00",
      "maxStudents": 35,
      "notes": "Updated room and time",
      "updatedBy": 1,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

---

## 7. Delete Class Schedule

**Endpoint:** `DELETE /api/class-schedules/:id`

**Access:** Admin only

**Path Parameters:**
- `id`: Class schedule ID

**Example Request:**
```bash
DELETE /api/class-schedules/1
```

**Example Response:**
```json
{
  "success": true,
  "message": "Class schedule deleted successfully"
}
```

**Note:** Cannot delete if attendance records exist for this schedule.

---

## 8. Get Class Schedules by Teacher

**Endpoint:** `GET /api/class-schedules/teacher/:teacherId`

**Access:** Admin, Teacher

**Path Parameters:**
- `teacherId`: Teacher ID

**Query Parameters:**
- `isActive` (optional): Filter by active status (default: true)
- `academicYear` (optional): Filter by academic year
- `semester` (optional): Filter by semester

**Example Request:**
```bash
GET /api/class-schedules/teacher/3?academicYear=2024-25&semester=3
```

---

## 9. Get Class Schedules by Guest Teacher

**Endpoint:** `GET /api/class-schedules/guest-teacher/:guestTeacherId`

**Access:** Admin, Teacher

**Path Parameters:**
- `guestTeacherId`: Guest teacher ID

**Query Parameters:**
- `isActive` (optional): Filter by active status (default: true)
- `academicYear` (optional): Filter by academic year
- `semester` (optional): Filter by semester

---

## 10. Get Class Schedules by Subject

**Endpoint:** `GET /api/class-schedules/subject/:subjectId`

**Access:** Admin, Teacher, Student

**Path Parameters:**
- `subjectId`: Subject ID

**Query Parameters:**
- `isActive` (optional): Filter by active status (default: true)
- `academicYear` (optional): Filter by academic year
- `semester` (optional): Filter by semester

---

## 11. Get Class Schedules by Room

**Endpoint:** `GET /api/class-schedules/room/:roomNumber`

**Access:** Admin, Teacher, Student

**Path Parameters:**
- `roomNumber`: Room number/identifier

**Query Parameters:**
- `isActive` (optional): Filter by active status (default: true)
- `academicYear` (optional): Filter by academic year
- `semester` (optional): Filter by semester

**Example Request:**
```bash
GET /api/class-schedules/room/A101?academicYear=2024-25
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "startTime",
      "message": "End time must be after start time"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. Invalid or missing token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Class schedule not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Teacher has a conflicting class schedule at 09:00 - 10:30"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Business Rules

1. **Teacher Assignment**: Each class schedule must have exactly one teacher OR one guest teacher, never both or neither.

2. **Time Conflicts**: The system prevents:
   - Same teacher having overlapping schedules
   - Same room being booked at overlapping times
   - Same guest teacher having overlapping schedules

3. **Academic Period**: Class schedules are organized by academic year and semester for better management.

4. **Recurring Schedules**: Schedules can be marked as recurring with optional start and end dates.

5. **Room Management**: Room numbers are tracked to prevent double-booking.

6. **Attendance Integration**: Class schedules are linked to attendance records and cannot be deleted if attendance exists.

7. **Access Control**: 
   - Only admins can create, update, or delete schedules
   - Teachers can view their own schedules and general schedules
   - Students can view schedules for their courses

---

## Usage Examples

### Creating a Weekly Schedule
```bash
# Monday - Data Structures
POST /api/class-schedules
{
  "subjectId": 5,
  "teacherId": 3,
  "roomNumber": "A101",
  "scheduleDay": "monday",
  "startTime": "09:00",
  "endTime": "10:30",
  "classType": "theory",
  "semester": 3,
  "academicYear": "2024-25"
}

# Tuesday - Data Structures Lab
POST /api/class-schedules
{
  "subjectId": 5,
  "teacherId": 3,
  "roomNumber": "LAB101",
  "scheduleDay": "tuesday",
  "startTime": "14:00",
  "endTime": "16:00",
  "classType": "lab",
  "semester": 3,
  "academicYear": "2024-25"
}
```

### Getting Teacher's Schedule
```bash
GET /api/class-schedules/teacher/3?academicYear=2024-25&semester=3
```

### Checking Room Availability
```bash
GET /api/class-schedules/room/A101?academicYear=2024-25&semester=3
```

This API provides comprehensive class schedule management with proper validation, conflict detection, and role-based access control.
