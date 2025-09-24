# Students Table Documentation

## Overview
The `students` table stores student profile information and is linked to the `users` table for authentication and basic user data.

## Table Structure

### Primary Key
- `id` (INT, AUTO_INCREMENT) - Primary key

### Foreign Keys
- `user_id` (INT, NOT NULL, UNIQUE) - References `users.id`
- `department_id` (INT, NOT NULL) - References `departments.id`
- `course_id` (INT, NOT NULL) - References `courses.id`

### Student Identification
- `roll_number` (VARCHAR(20), NOT NULL, UNIQUE) - Unique student roll number

### Academic Information
- `semester` (INT, NOT NULL) - Current semester (1-8)
- `admission_year` (INT, NOT NULL) - Year of admission

### Contact Information
- `guardian_name` (VARCHAR(100)) - Name of guardian/parent
- `guardian_phone` (VARCHAR(15)) - Guardian contact number
- `phone` (VARCHAR(15)) - Student primary phone number
- `additional_phone` (VARCHAR(15)) - Student secondary phone number
- `address` (TEXT) - Student residential address

### Financial Information
- `fees_paid` (DECIMAL(10, 2), DEFAULT 0.00) - Total fees paid by student

### Timestamps
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) - Last update time

## Constraints

### Check Constraints
- `chk_semester_range`: Semester must be between 1 and 8
- `chk_admission_year`: Admission year must be between 2000 and 2030
- `chk_fees_paid_positive`: Fees paid must be non-negative

### Foreign Key Constraints
- `fk_students_user_id`: Links to users table with CASCADE delete
- `fk_students_department_id`: Links to departments table with RESTRICT delete
- `fk_students_course_id`: Links to courses table with RESTRICT delete

## Indexes

### Primary Indexes
- `idx_students_roll_number`: On `roll_number` (unique)
- `idx_students_department_semester`: On `department_id, semester` (composite)
- `idx_students_course_id`: On `course_id`
- `idx_students_admission_year`: On `admission_year`

### Secondary Indexes
- `idx_students_user_id`: On `user_id`
- `idx_students_phone`: On `phone`
- `idx_students_additional_phone`: On `additional_phone`

## Relationships

### Belongs To
- `User` (via `user_id`) - One student belongs to one user
- `Department` (via `department_id`) - One student belongs to one department
- `Course` (via `course_id`) - One student belongs to one course

### Has Many
- `Attendance` (via `student_id`) - One student has many attendance records
- `Mark` (via `student_id`) - One student has many marks
- `StudentPayment` (via `student_id`) - One student has many payment records
- `AttendanceRewardFine` (via `student_id`) - One student has many reward/fine records

## Usage Examples

### Insert a new student
```sql
INSERT INTO students (
    user_id, roll_number, department_id, course_id, 
    semester, admission_year, guardian_name, guardian_phone, 
    phone, address, fees_paid
) VALUES (
    1, 'STU001', 1, 1, 
    1, 2024, 'John Doe', '+1234567890', 
    '+1234567891', '123 Main St, City', 0.00
);
```

### Query students by department and semester
```sql
SELECT s.*, u.name, d.name as department_name, c.name as course_name
FROM students s
JOIN users u ON s.user_id = u.id
JOIN departments d ON s.department_id = d.id
JOIN courses c ON s.course_id = c.id
WHERE s.department_id = 1 AND s.semester = 1;
```

### Update student information
```sql
UPDATE students 
SET phone = '+1234567892', 
    address = '456 New St, City',
    updated_at = CURRENT_TIMESTAMP
WHERE roll_number = 'STU001';
```

### Delete a student (cascades to user)
```sql
DELETE FROM students WHERE id = 1;
-- This will also delete the associated user record due to CASCADE
```

## Notes
- The table uses snake_case naming convention for database columns
- All foreign key relationships are properly constrained
- Indexes are optimized for common query patterns
- Timestamps are automatically managed
- The table supports both guardian and student contact information
