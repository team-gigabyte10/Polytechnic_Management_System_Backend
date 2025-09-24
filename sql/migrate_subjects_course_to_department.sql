-- Migration script to replace course_id with department_id in subjects table
-- This script safely migrates the subjects table structure

-- Step 1: Add the new department_id column
ALTER TABLE subjects 
ADD COLUMN department_id INT AFTER course_id;

-- Step 2: Populate department_id based on existing course_id
-- This assumes that courses have a department_id field
UPDATE subjects s
INNER JOIN courses c ON s.course_id = c.id
SET s.department_id = c.department_id;

-- Step 3: Make department_id NOT NULL after populating data
ALTER TABLE subjects 
MODIFY COLUMN department_id INT NOT NULL;

-- Step 4: Add foreign key constraint for department_id
ALTER TABLE subjects 
ADD CONSTRAINT fk_subjects_department 
FOREIGN KEY (department_id) REFERENCES departments(id);

-- Step 5: Add index for department_id
ALTER TABLE subjects 
ADD INDEX idx_subjects_department_semester (department_id, semester);

-- Step 6: Remove old foreign key constraint for course_id
ALTER TABLE subjects 
DROP FOREIGN KEY fk_subjects_course;

-- Step 7: Remove old index for course_id
ALTER TABLE subjects 
DROP INDEX idx_subjects_course_semester;

-- Step 8: Drop the course_id column
ALTER TABLE subjects 
DROP COLUMN course_id;

-- Step 9: Update the model associations (this would be done in the application code)
-- Subject.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
-- Remove: Subject.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });

-- Verification queries to check the migration
-- SELECT * FROM subjects LIMIT 5;
-- SHOW CREATE TABLE subjects;
-- SELECT COUNT(*) as total_subjects FROM subjects;
-- SELECT department_id, COUNT(*) as subject_count FROM subjects GROUP BY department_id;
