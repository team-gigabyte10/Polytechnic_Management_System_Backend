-- Polytechnic Management System Database Schema
-- Normalized to 3NF with proper constraints and indexes

CREATE DATABASE polytechnic_management;
USE polytechnic_management;

-- Users table (Base table for authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'guest') NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Departments table (Normalized department data)
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    head_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
);

-- Courses table
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    duration_years INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_department (department_id),
    INDEX idx_code (code)
);

-- Students table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    course_id INT NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    admission_year YEAR NOT NULL,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(15),
    address TEXT,
    fees_paid DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    INDEX idx_roll (roll_number),
    INDEX idx_department_semester (department_id, semester),
    INDEX idx_course (course_id)
);

-- Teachers table
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    designation VARCHAR(50),
    qualification VARCHAR(200),
    experience_years INT DEFAULT 0,
    salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    joining_date DATE,
    phone VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department_id)
);

-- Guest Teachers table
CREATE TABLE guest_teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    payment_type ENUM('hourly', 'per_class', 'per_session', 'monthly') NOT NULL DEFAULT 'hourly',
    rate DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    qualification VARCHAR(200),
    phone VARCHAR(15),
    address TEXT,
    total_hours_taught DECIMAL(8,2) DEFAULT 0.00,
    total_sessions_taught INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department_id)
);

-- Subjects table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    course_id INT NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    credits INT DEFAULT 3,
    theory_hours INT DEFAULT 3,
    practical_hours INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    INDEX idx_course_semester (course_id, semester),
    INDEX idx_code (code)
);

-- Classes table (Class schedules)
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    teacher_id INT,
    guest_teacher_id INT,
    room_number VARCHAR(20),
    schedule_day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_type ENUM('theory', 'practical', 'lab') DEFAULT 'theory',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (guest_teacher_id) REFERENCES guest_teachers(id) ON DELETE SET NULL,
    CHECK ((teacher_id IS NOT NULL AND guest_teacher_id IS NULL) OR 
           (teacher_id IS NULL AND guest_teacher_id IS NOT NULL)),
    INDEX idx_subject (subject_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_guest_teacher (guest_teacher_id),
    INDEX idx_schedule (schedule_day, start_time)
);

-- Attendance table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'absent',
    marked_by INT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (class_id, student_id, date),
    INDEX idx_student_date (student_id, date),
    INDEX idx_class_date (class_id, date)
);

-- Marks table
CREATE TABLE marks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    student_id INT NOT NULL,
    exam_type ENUM('quiz', 'midterm', 'final', 'assignment', 'project') NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    obtained_marks DECIMAL(5,2) NOT NULL,
    grade VARCHAR(2),
    exam_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_subject (student_id, subject_id),
    INDEX idx_exam_type (exam_type)
);

-- Announcements table
CREATE TABLE announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_audience ENUM('all', 'students', 'teachers', 'staff', 'department') NOT NULL DEFAULT 'all',
    department_id INT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_target_audience (target_audience),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at)
);

-- Salaries table (For both regular and guest teachers)
CREATE TABLE salaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT,
    guest_teacher_id INT,
    month DATE NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    overtime_amount DECIMAL(10,2) DEFAULT 0.00,
    bonus DECIMAL(10,2) DEFAULT 0.00,
    deductions DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    hours_worked DECIMAL(8,2) DEFAULT 0.00,
    sessions_taught INT DEFAULT 0,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    payment_method ENUM('cash', 'bank_transfer', 'cheque') DEFAULT 'bank_transfer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_teacher_id) REFERENCES guest_teachers(id) ON DELETE CASCADE,
    CHECK ((teacher_id IS NOT NULL AND guest_teacher_id IS NULL) OR 
           (teacher_id IS NULL AND guest_teacher_id IS NOT NULL)),
    UNIQUE KEY unique_teacher_month (teacher_id, month),
    UNIQUE KEY unique_guest_teacher_month (guest_teacher_id, month),
    INDEX idx_month (month),
    INDEX idx_is_paid (is_paid)
);

-- Student Payments table
CREATE TABLE student_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('tuition_fee', 'admission_fee', 'exam_fee', 'library_fee', 'lab_fee', 'other') NOT NULL,
    semester INT,
    academic_year VARCHAR(10),
    payment_method ENUM('cash', 'bank_transfer', 'online', 'cheque') DEFAULT 'cash',
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    due_date DATE,
    paid_date DATE,
    late_fee DECIMAL(8,2) DEFAULT 0.00,
    discount DECIMAL(8,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_status (student_id, status),
    INDEX idx_payment_type (payment_type),
    INDEX idx_due_date (due_date)
);

-- Expenses table
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    category ENUM('salary', 'utilities', 'maintenance', 'equipment', 'supplies', 'transport', 'marketing', 'other') NOT NULL,
    expense_date DATE NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'cheque', 'online') DEFAULT 'cash',
    receipt_number VARCHAR(50),
    vendor_name VARCHAR(100),
    department_id INT,
    approved_by INT,
    added_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category_date (category, expense_date),
    INDEX idx_expense_date (expense_date),
    INDEX idx_department (department_id)
);

-- Attendance Rewards and Fines
CREATE TABLE attendance_rewards_fines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    type ENUM('reward', 'fine') NOT NULL,
    amount DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    reason VARCHAR(255),
    month DATE NOT NULL,
    attendance_percentage DECIMAL(5,2),
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_month (student_id, month),
    INDEX idx_type (type)
);

-- Session Management for Guest Teachers
CREATE TABLE teaching_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    guest_teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hours_taught DECIMAL(4,2) NOT NULL,
    topics_covered TEXT,
    students_present INT DEFAULT 0,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_teacher_id) REFERENCES guest_teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_guest_teacher_date (guest_teacher_id, session_date),
    INDEX idx_class_date (class_id, session_date)
);

-- Add foreign key constraints that were referenced earlier
ALTER TABLE departments ADD FOREIGN KEY (head_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_students_admission_year ON students(admission_year);
CREATE INDEX idx_teachers_joining_date ON teachers(joining_date);
CREATE INDEX idx_subjects_credits ON subjects(credits);
CREATE INDEX idx_marks_exam_date ON marks(exam_date);
CREATE INDEX idx_salaries_created_at ON salaries(created_at);
CREATE INDEX idx_expenses_vendor ON expenses(vendor_name);