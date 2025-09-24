-- Add phone and additional_phone fields to students table
-- Migration: 20250120000000_add_phone_fields_to_students.sql

-- Add phone field to students table
ALTER TABLE students 
ADD COLUMN phone VARCHAR(15) NULL AFTER guardian_phone;

-- Add additional_phone field to students table  
ALTER TABLE students 
ADD COLUMN additional_phone VARCHAR(15) NULL AFTER phone;

-- Add indexes for better performance on phone lookups
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_additional_phone ON students(additional_phone);
