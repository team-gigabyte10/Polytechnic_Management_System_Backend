-- Simple version of students table creation
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    course_id INT NOT NULL,
    semester INT NOT NULL,
    admission_year INT NOT NULL,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(15),
    phone VARCHAR(15),
    additional_phone VARCHAR(15),
    address TEXT,
    fees_paid DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_semester_range CHECK (semester >= 1 AND semester <= 8),
    CONSTRAINT chk_admission_year CHECK (admission_year >= 2000 AND admission_year <= 2030),
    CONSTRAINT chk_fees_paid_positive CHECK (fees_paid >= 0.00),
    
    CONSTRAINT fk_students_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT fk_students_department_id 
        FOREIGN KEY (department_id) REFERENCES departments(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    CONSTRAINT fk_students_course_id 
        FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_department_semester ON students(department_id, semester);
CREATE INDEX idx_students_course_id ON students(course_id);
CREATE INDEX idx_students_admission_year ON students(admission_year);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_additional_phone ON students(additional_phone);
