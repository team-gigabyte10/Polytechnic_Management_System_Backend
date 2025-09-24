-- Create students table with proper snake_case column naming
-- This table stores student profile information linked to users

CREATE TABLE IF NOT EXISTS students (
    -- Primary key
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Foreign key to users table
    user_id INT NOT NULL UNIQUE,
    
    -- Student identification
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    
    -- Academic information
    department_id INT NOT NULL,
    semester INT NOT NULL,
    admission_year INT NOT NULL,
    
    -- Contact information
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(15),
    phone VARCHAR(15),
    additional_phone VARCHAR(15),
    address TEXT,
    
    -- Financial information
    fees_paid DECIMAL(10, 2) DEFAULT 0.00,
    payment_paid DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Timestamps (automatically managed by Sequelize)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_semester_range CHECK (semester >= 1 AND semester <= 8),
    CONSTRAINT chk_admission_year CHECK (admission_year >= 2000 AND admission_year <= 2030),
    CONSTRAINT chk_fees_paid_positive CHECK (fees_paid >= 0.00),
    
    -- Foreign key constraints
    CONSTRAINT fk_students_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT fk_students_department_id 
        FOREIGN KEY (department_id) REFERENCES departments(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
);

-- Create indexes for better query performance
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_department_semester ON students(department_id, semester);
CREATE INDEX idx_students_admission_year ON students(admission_year);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_phone ON students(phone);

-- Add comments for documentation
ALTER TABLE students COMMENT = 'Student profile information linked to users table';

-- Column comments
ALTER TABLE students MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'Primary key';
ALTER TABLE students MODIFY COLUMN user_id INT NOT NULL COMMENT 'Foreign key to users table';
ALTER TABLE students MODIFY COLUMN roll_number VARCHAR(20) NOT NULL COMMENT 'Unique student roll number';
ALTER TABLE students MODIFY COLUMN department_id INT NOT NULL COMMENT 'Foreign key to departments table';
ALTER TABLE students MODIFY COLUMN semester INT NOT NULL COMMENT 'Current semester (1-8)';
ALTER TABLE students MODIFY COLUMN admission_year INT NOT NULL COMMENT 'Year of admission';
ALTER TABLE students MODIFY COLUMN guardian_name VARCHAR(100) COMMENT 'Name of guardian/parent';
ALTER TABLE students MODIFY COLUMN guardian_phone VARCHAR(15) COMMENT 'Guardian contact number';
ALTER TABLE students MODIFY COLUMN phone VARCHAR(15) COMMENT 'Student primary phone number';
ALTER TABLE students MODIFY COLUMN additional_phone VARCHAR(15) COMMENT 'Student secondary phone number';
ALTER TABLE students MODIFY COLUMN address TEXT COMMENT 'Student residential address';
ALTER TABLE students MODIFY COLUMN fees_paid DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total fees paid by student';
ALTER TABLE students MODIFY COLUMN payment_paid DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total fees paid by student';
ALTER TABLE students MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp';
ALTER TABLE students MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp';
