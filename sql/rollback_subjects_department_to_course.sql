-- Rollback script to revert department_id back to course_id in subjects table
-- WARNING: This will lose data if courses were deleted after migration

-- Step 1: Add course_id column back
ALTER TABLE subjects 
ADD COLUMN course_id INT AFTER department_id;

-- Step 2: Populate course_id based on department_id
-- This assumes you have a way to map department_id back to course_id
-- You may need to manually specify which course each subject belongs to
-- Example: UPDATE subjects SET course_id = 1 WHERE department_id = 1;

-- Step 3: Make course_id NOT NULL after populating data
ALTER TABLE subjects 
MODIFY COLUMN course_id INT NOT NULL;

-- Step 4: Add foreign key constraint for course_id
ALTER TABLE subjects 
ADD CONSTRAINT fk_subjects_course 
FOREIGN KEY (course_id) REFERENCES courses(id);

-- Step 5: Add index for course_id
ALTER TABLE subjects 
ADD INDEX idx_subjects_course_semester (course_id, semester);

-- Step 6: Remove foreign key constraint for department_id
ALTER TABLE subjects 
DROP FOREIGN KEY fk_subjects_department;

-- Step 7: Remove index for department_id
ALTER TABLE subjects 
DROP INDEX idx_subjects_department_semester;

-- Step 8: Drop the department_id column
ALTER TABLE subjects 
DROP COLUMN department_id;

-- Verification queries
-- SELECT * FROM subjects LIMIT 5;
-- SHOW CREATE TABLE subjects;
-- SELECT COUNT(*) as total_subjects FROM subjects;
-- SELECT course_id, COUNT(*) as subject_count FROM subjects GROUP BY course_id;
