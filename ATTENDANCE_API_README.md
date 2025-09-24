# Attendance API Documentation

This document provides comprehensive documentation for the Attendance API endpoints in the Polytechnic Management System.

## Base URL
```
/api/attendance
```

## Authentication
All attendance endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints Overview

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | `/mark` | Mark attendance for a class | Teacher/Admin |
| GET | `/class/:classId` | Get class attendance for specific date | Teacher/Admin |
| GET | `/student/:studentId/report` | Get student attendance report | All Authenticated Users |
| GET | `/class/:classId/summary` | Get class attendance summary | Teacher/Admin |
| GET | `/rewards-fines` | Get attendance rewards and fines | All Authenticated Users |
| GET | `/statistics` | Get attendance statistics for dashboard | All Authenticated Users |
| PUT | `/:attendanceId` | Update single attendance record | Teacher/Admin |
| DELETE | `/:attendanceId` | Delete attendance record | Teacher/Admin |
| GET | `/class/:classId/calendar` | Get attendance calendar for a class | Teacher/Admin |
| PUT | `/bulk-update` | Bulk update attendance records | Teacher/Admin |

---

## 1. Mark Attendance

**Endpoint:** `POST /api/attendance/mark`

**Description:** Mark attendance for multiple students in a class for a specific date.

**Access Level:** Teacher/Admin only

**Request Body:**
```json
{
  "classId": 1,
  "date": "2024-01-15",
  "attendanceList": [
    {
      "studentId": 1,
      "status": "present"
    },
    {
      "studentId": 2,
      "status": "absent"
    },
    {
      "studentId": 3,
      "status": "late"
    }
  ]
}
```

**Request Parameters:**
- `classId` (integer, required): ID of the class
- `date` (date, required): Date for attendance (YYYY-MM-DD format)
- `attendanceList` (array, required): Array of attendance records
  - `studentId` (integer, required): ID of the student
  - `status` (string, required): Attendance status - "present", "absent", or "late"

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully"
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Class not found
- `401`: Unauthorized access
- `403`: Insufficient permissions

---

## 2. Get Class Attendance

**Endpoint:** `GET /api/attendance/class/:classId?date=YYYY-MM-DD`

**Description:** Get attendance records for all students in a class for a specific date.

**Access Level:** Teacher/Admin only

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "classId": 1,
    "date": "2024-01-15",
    "studentsWithAttendance": [
      {
        "student": {
          "id": 1,
          "rollNumber": "2024001",
          "user": {
            "name": "John Doe",
            "email": "john@example.com"
          }
        },
        "attendance": {
          "id": 1,
          "status": "present",
          "markedAt": "2024-01-15T10:30:00.000Z",
          "markedBy": 2
        }
      }
    ],
    "summary": {
      "total": 30,
      "present": 25,
      "absent": 3,
      "late": 2
    }
  }
}
```

**Error Responses:**
- `400`: Date parameter missing
- `404`: Class not found
- `401`: Unauthorized access
- `403`: Insufficient permissions

---

## 3. Get Student Attendance Report

**Endpoint:** `GET /api/attendance/student/:studentId/report`

**Description:** Get detailed attendance report for a specific student.

**Access Level:** All authenticated users

**Query Parameters:**
- `startDate` (optional): Start date for report period (YYYY-MM-DD)
- `endDate` (optional): End date for report period (YYYY-MM-DD)
- `subjectId` (optional): Filter by specific subject

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": 1,
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "overallSummary": {
      "total": 45,
      "present": 40,
      "absent": 3,
      "late": 2,
      "attendancePercentage": "93.33"
    },
    "subjectWise": [
      {
        "subject": {
          "name": "Mathematics",
          "code": "MATH101"
        },
        "total": 15,
        "present": 14,
        "absent": 1,
        "late": 0,
        "attendancePercentage": "93.33",
        "attendances": [
          {
            "id": 1,
            "date": "2024-01-15",
            "status": "present",
            "class": {
              "subject": {
                "name": "Mathematics",
                "code": "MATH101"
              }
            }
          }
        ]
      }
    ]
  }
}
```

---

## 4. Get Class Attendance Summary

**Endpoint:** `GET /api/attendance/class/:classId/summary`

**Description:** Get attendance summary for all students in a class over a period.

**Access Level:** Teacher/Admin only

**Query Parameters:**
- `startDate` (optional): Start date for summary period (YYYY-MM-DD)
- `endDate` (optional): End date for summary period (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "classId": 1,
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "students": [
      {
        "student": {
          "id": 1,
          "rollNumber": "2024001",
          "user": {
            "name": "John Doe",
            "email": "john@example.com"
          }
        },
        "total": 20,
        "present": 18,
        "absent": 1,
        "late": 1,
        "attendancePercentage": "95.00"
      }
    ]
  }
}
```

---

## 5. Get Attendance Rewards and Fines

**Endpoint:** `GET /api/attendance/rewards-fines`

**Description:** Get attendance-based rewards and fines for students.

**Access Level:** All authenticated users

**Query Parameters:**
- `studentId` (optional): Filter by specific student
- `month` (optional): Filter by specific month (YYYY-MM format)
- `type` (optional): Filter by type - "reward" or "fine"
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of records per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "rewardsAndFines": [
      {
        "id": 1,
        "type": "reward",
        "amount": 500,
        "reason": "Excellent attendance: 98.5%",
        "month": "2024-01",
        "attendancePercentage": "98.50",
        "student": {
          "id": 1,
          "rollNumber": "2024001",
          "user": {
            "name": "John Doe",
            "email": "john@example.com"
          }
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

## Attendance Status Values

- **present**: Student was present for the class
- **absent**: Student was absent from the class
- **late**: Student was present but arrived late

## Reward and Fine System

The system automatically calculates rewards and fines based on monthly attendance:

### Rewards
- **Excellent Attendance (≥95%)**: ₹500 reward
- **Good Attendance (≥85%)**: ₹200 reward

### Fines
- **Poor Attendance (<75%)**: ₹100 fine

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
```

## Common HTTP Status Codes

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Usage Examples

### Mark Attendance for Today
```bash
curl -X POST http://localhost:3000/api/attendance/mark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "classId": 1,
    "date": "2024-01-15",
    "attendanceList": [
      {"studentId": 1, "status": "present"},
      {"studentId": 2, "status": "late"}
    ]
  }'
```

### Get Today's Class Attendance
```bash
curl -X GET "http://localhost:3000/api/attendance/class/1?date=2024-01-15" \
  -H "Authorization: Bearer your-jwt-token"
```

### Get Student Report for January 2024
```bash
curl -X GET "http://localhost:3000/api/attendance/student/1/report?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer your-jwt-token"
```

---

## 6. Get Attendance Statistics

**Endpoint:** `GET /api/attendance/statistics`

**Description:** Get comprehensive attendance statistics for dashboard and reporting.

**Access Level:** All authenticated users

**Query Parameters:**
- `startDate` (optional): Start date for statistics period (YYYY-MM-DD)
- `endDate` (optional): End date for statistics period (YYYY-MM-DD)
- `departmentId` (optional): Filter by specific department
- `semester` (optional): Filter by specific semester

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "total": 1500,
      "present": 1200,
      "absent": 200,
      "late": 100,
      "attendancePercentage": "86.67"
    },
    "department": {
      "total": 500,
      "present": 450,
      "absent": 30,
      "late": 20,
      "attendancePercentage": "94.00"
    },
    "recentTrends": [
      {
        "date": "2024-01-15",
        "status": "present",
        "count": 25
      }
    ]
  }
}
```

---

## 7. Update Attendance Record

**Endpoint:** `PUT /api/attendance/:attendanceId`

**Description:** Update a single attendance record.

**Access Level:** Teacher/Admin only

**Request Body:**
```json
{
  "status": "present"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "id": 1,
    "classId": 1,
    "studentId": 1,
    "date": "2024-01-15",
    "status": "present",
    "markedBy": 2,
    "markedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 8. Delete Attendance Record

**Endpoint:** `DELETE /api/attendance/:attendanceId`

**Description:** Delete an attendance record.

**Access Level:** Teacher/Admin only

**Response:**
```json
{
  "success": true,
  "message": "Attendance record deleted successfully"
}
```

---

## 9. Get Attendance Calendar

**Endpoint:** `GET /api/attendance/class/:classId/calendar`

**Description:** Get attendance data organized by calendar for a specific class.

**Access Level:** Teacher/Admin only

**Query Parameters:**
- `month` (optional): Month number (1-12, default: current month)
- `year` (optional): Year (default: current year)

**Response:**
```json
{
  "success": true,
  "data": {
    "classId": 1,
    "month": 1,
    "year": 2024,
    "calendarData": {
      "2024-01-15": [
        {
          "id": 1,
          "status": "present",
          "student": {
            "id": 1,
            "rollNumber": "2024001",
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

## 10. Bulk Update Attendance

**Endpoint:** `PUT /api/attendance/bulk-update`

**Description:** Update multiple attendance records in a single operation.

**Access Level:** Teacher/Admin only

**Request Body:**
```json
{
  "classId": 1,
  "date": "2024-01-15",
  "updates": [
    {
      "studentId": 1,
      "status": "present"
    },
    {
      "studentId": 2,
      "status": "late"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk attendance update completed successfully"
}
```

## Notes

1. All dates should be in YYYY-MM-DD format
2. The system automatically calculates monthly rewards and fines when attendance is marked
3. Attendance records are unique per student per class per date
4. Teachers and admins can mark and view attendance for any class
5. Students can only view their own attendance reports
6. The system supports pagination for large datasets
7. Bulk operations are more efficient for updating multiple records
8. Calendar view provides a month-wise overview of attendance patterns
9. Statistics endpoint is useful for dashboard and reporting features
10. All update operations maintain audit trail with markedBy and markedAt fields
