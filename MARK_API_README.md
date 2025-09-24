# Mark Management API Documentation

## Overview
The Mark Management API provides comprehensive functionality for managing student marks, grades, and academic performance tracking in the Polytechnic Management System.

## Base URL
```
/api/marks
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Marks
**GET** `/api/marks`

Retrieve all marks with filtering and pagination options.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `studentId` (optional): Filter by student ID
- `subjectId` (optional): Filter by subject ID
- `examType` (optional): Filter by exam type (quiz, midterm, final, assignment, project)
- `semester` (optional): Filter by semester
- `departmentId` (optional): Filter by department ID
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `grade` (optional): Filter by grade

**Authorization:** Admin, Teacher

**Response:**
```json
{
  "success": true,
  "data": {
    "marks": [
      {
        "id": 1,
        "subjectId": 1,
        "studentId": 1,
        "examType": "midterm",
        "totalMarks": 100,
        "obtainedMarks": 85,
        "grade": "A",
        "examDate": "2024-01-15",
        "createdBy": 2,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "student": {
          "id": 1,
          "rollNumber": "2024001",
          "semester": 1,
          "user": {
            "name": "John Doe",
            "email": "john@example.com"
          },
          "department": {
            "name": "Computer Science",
            "code": "CS"
          }
        },
        "subject": {
          "id": 1,
          "name": "Programming Fundamentals",
          "code": "CS101",
          "department": {
            "name": "Computer Science",
            "code": "CS"
          }
        },
        "creator": {
          "name": "Dr. Smith",
          "email": "smith@example.com"
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

### 2. Get Mark by ID
**GET** `/api/marks/:id`

Retrieve a specific mark by its ID.

**Authorization:** Admin, Teacher, Student (own marks only)

**Response:**
```json
{
  "success": true,
  "data": {
    "mark": {
      "id": 1,
      "subjectId": 1,
      "studentId": 1,
      "examType": "midterm",
      "totalMarks": 100,
      "obtainedMarks": 85,
      "grade": "A",
      "examDate": "2024-01-15",
      "createdBy": 2,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "student": {
        "id": 1,
        "rollNumber": "2024001",
        "semester": 1,
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "department": {
          "name": "Computer Science",
          "code": "CS"
        }
      },
      "subject": {
        "id": 1,
        "name": "Programming Fundamentals",
        "code": "CS101",
        "department": {
          "name": "Computer Science",
          "code": "CS"
        }
      },
      "creator": {
        "name": "Dr. Smith",
        "email": "smith@example.com"
      }
    }
  }
}
```

### 3. Create Mark
**POST** `/api/marks`

Create a new mark record.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "subjectId": 1,
  "studentId": 1,
  "examType": "midterm",
  "totalMarks": 100,
  "obtainedMarks": 85,
  "grade": "A",
  "examDate": "2024-01-15"
}
```

**Validation Rules:**
- `subjectId`: Required, positive integer
- `studentId`: Required, positive integer
- `examType`: Required, one of: quiz, midterm, final, assignment, project
- `totalMarks`: Required, positive number, max 1000
- `obtainedMarks`: Required, number between 0 and 1000
- `grade`: Optional, max 2 characters
- `examDate`: Optional, ISO date format

**Response:**
```json
{
  "success": true,
  "message": "Mark created successfully",
  "data": {
    "mark": {
      "id": 1,
      "subjectId": 1,
      "studentId": 1,
      "examType": "midterm",
      "totalMarks": 100,
      "obtainedMarks": 85,
      "grade": "A",
      "examDate": "2024-01-15",
      "createdBy": 2,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 4. Update Mark
**PUT** `/api/marks/:id`

Update an existing mark record.

**Authorization:** Admin, Teacher (creator only)

**Request Body:**
```json
{
  "obtainedMarks": 90,
  "grade": "A+"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mark updated successfully",
  "data": {
    "mark": {
      "id": 1,
      "subjectId": 1,
      "studentId": 1,
      "examType": "midterm",
      "totalMarks": 100,
      "obtainedMarks": 90,
      "grade": "A+",
      "examDate": "2024-01-15",
      "createdBy": 2,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 5. Delete Mark
**DELETE** `/api/marks/:id`

Delete a mark record.

**Authorization:** Admin, Teacher (creator only)

**Response:**
```json
{
  "success": true,
  "message": "Mark deleted successfully"
}
```

### 6. Get Student Marks
**GET** `/api/marks/student/:studentId`

Retrieve all marks for a specific student.

**Query Parameters:**
- `subjectId` (optional): Filter by subject ID
- `examType` (optional): Filter by exam type
- `semester` (optional): Filter by semester
- `academicYear` (optional): Filter by academic year

**Authorization:** Admin, Teacher, Student (own marks only)

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 1,
      "rollNumber": "2024001",
      "semester": 1,
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "department": {
        "name": "Computer Science",
        "code": "CS"
      }
    },
    "marks": [
      {
        "id": 1,
        "subjectId": 1,
        "studentId": 1,
        "examType": "midterm",
        "totalMarks": 100,
        "obtainedMarks": 85,
        "grade": "A",
        "examDate": "2024-01-15"
      }
    ],
    "statistics": {
      "totalMarks": 5,
      "averagePercentage": 82.5,
      "gradeDistribution": {
        "A": 2,
        "B+": 2,
        "B": 1
      },
      "examTypeDistribution": {
        "quiz": 2,
        "midterm": 1,
        "final": 1,
        "assignment": 1
      }
    }
  }
}
```

### 7. Get Subject Marks
**GET** `/api/marks/subject/:subjectId`

Retrieve all marks for a specific subject.

**Query Parameters:**
- `examType` (optional): Filter by exam type
- `semester` (optional): Filter by semester
- `academicYear` (optional): Filter by academic year

**Authorization:** Admin, Teacher

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": {
      "id": 1,
      "name": "Programming Fundamentals",
      "code": "CS101",
      "department": {
        "name": "Computer Science",
        "code": "CS"
      }
    },
    "marks": [
      {
        "id": 1,
        "subjectId": 1,
        "studentId": 1,
        "examType": "midterm",
        "totalMarks": 100,
        "obtainedMarks": 85,
        "grade": "A",
        "examDate": "2024-01-15"
      }
    ],
    "statistics": {
      "totalStudents": 30,
      "averagePercentage": 78.5,
      "passRate": 86.7,
      "gradeDistribution": {
        "A+": 5,
        "A": 8,
        "B+": 10,
        "B": 4,
        "C+": 2,
        "C": 1
      }
    }
  }
}
```

### 8. Bulk Create Marks
**POST** `/api/marks/bulk`

Create multiple marks in a single request.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "marks": [
    {
      "subjectId": 1,
      "studentId": 1,
      "examType": "quiz",
      "totalMarks": 20,
      "obtainedMarks": 18,
      "grade": "A",
      "examDate": "2024-01-10"
    },
    {
      "subjectId": 1,
      "studentId": 2,
      "examType": "quiz",
      "totalMarks": 20,
      "obtainedMarks": 16,
      "grade": "B+",
      "examDate": "2024-01-10"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk mark creation completed. 2 successful, 0 failed",
  "data": {
    "successful": [
      {
        "id": 1,
        "subjectId": 1,
        "studentId": 1,
        "examType": "quiz",
        "totalMarks": 20,
        "obtainedMarks": 18,
        "grade": "A",
        "examDate": "2024-01-10"
      }
    ],
    "failed": []
  }
}
```

### 9. Get Mark Statistics
**GET** `/api/marks/statistics/overview`

Retrieve comprehensive mark statistics.

**Query Parameters:**
- `departmentId` (optional): Filter by department ID
- `semester` (optional): Filter by semester
- `examType` (optional): Filter by exam type
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Authorization:** Admin, Teacher

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalMarks": 150,
      "averagePercentage": 75.2,
      "passRate": 82.0,
      "gradeDistribution": {
        "A+": 15,
        "A": 25,
        "B+": 35,
        "B": 30,
        "C+": 20,
        "C": 15,
        "D": 8,
        "F": 2
      },
      "examTypeDistribution": {
        "quiz": 50,
        "midterm": 30,
        "final": 30,
        "assignment": 25,
        "project": 15
      },
      "departmentDistribution": {
        "Computer Science": 60,
        "Electrical Engineering": 45,
        "Mechanical Engineering": 35,
        "Civil Engineering": 10
      },
      "semesterDistribution": {
        "1": 40,
        "2": 35,
        "3": 30,
        "4": 25,
        "5": 20
      }
    }
  }
}
```

## Grade Calculation

The system automatically calculates grades based on the following scale:

| Percentage | Grade |
|------------|-------|
| 90% and above | A+ |
| 80% - 89% | A |
| 70% - 79% | B+ |
| 60% - 69% | B |
| 50% - 59% | C+ |
| 40% - 49% | C |
| 33% - 39% | D |
| Below 33% | F |

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "obtainedMarks",
      "message": "Obtained marks cannot exceed total marks"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to update this mark"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Mark not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Development**: 1000 requests per 15 minutes
- **Production**: 100 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Business Rules

1. **Duplicate Prevention**: Marks cannot be created for the same student, subject, exam type, and date combination.

2. **Enrollment Validation**: Students must be enrolled in the subject (same department and semester) to receive marks.

3. **Mark Validation**: Obtained marks cannot exceed total marks.

4. **Permission Control**: 
   - Students can only view their own marks
   - Teachers can only update/delete marks they created
   - Admins have full access to all marks

5. **Grade Calculation**: If no grade is provided, it's automatically calculated based on the percentage.

6. **Bulk Operations**: Bulk mark creation supports up to 100 marks per request.

## Usage Examples

### Creating a Mark
```bash
curl -X POST http://localhost:3000/api/marks \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": 1,
    "studentId": 1,
    "examType": "midterm",
    "totalMarks": 100,
    "obtainedMarks": 85,
    "examDate": "2024-01-15"
  }'
```

### Getting Student Marks
```bash
curl -X GET "http://localhost:3000/api/marks/student/1?semester=1" \
  -H "Authorization: Bearer <your-token>"
```

### Bulk Creating Marks
```bash
curl -X POST http://localhost:3000/api/marks/bulk \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "marks": [
      {
        "subjectId": 1,
        "studentId": 1,
        "examType": "quiz",
        "totalMarks": 20,
        "obtainedMarks": 18
      },
      {
        "subjectId": 1,
        "studentId": 2,
        "examType": "quiz",
        "totalMarks": 20,
        "obtainedMarks": 16
      }
    ]
  }'
```

## Notes

- All dates should be in ISO format (YYYY-MM-DD)
- The system automatically sets the creator based on the authenticated user
- Grade calculation is performed automatically if not provided
- Statistics are calculated in real-time based on current data
- The API supports comprehensive filtering and pagination for large datasets



