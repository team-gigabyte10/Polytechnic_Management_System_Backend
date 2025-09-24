-- Safe migration script to replace course_id with department_id in subjects table
-- This script includes backup and validation steps

-- Step 1: Create backup table
CREATE TABLE subjects_backup AS SELECT * FROM subjects;

-- Step 2: Verify backup was created successfully
SELECT COUNT(*) as backup_count FROM subjects_backup;
SELECT COUNT(*) as original_count FROM subjects;

-- Step 3: Check for any subjects with invalid course_id references
SELECT s.id, s.course_id, s.name 
FROM subjects s 
LEFT JOIN courses c ON s.course_id = c.id 
WHERE c.id IS NULL;

-- Step 4: Check for any courses without department_id
SELECT c.id, c.name, c.department_id 
FROM courses c 
LEFT JOIN departments d ON c.department_id = d.id 
WHERE d.id IS NULL;

-- Step 5: Add the new department_id column
ALTER TABLE subjects 
ADD COLUMN department_id INT AFTER course_id;

-- Step 6: Populate department_id based on existing course_id
UPDATE subjects s
INNER JOIN courses c ON s.course_id = c.id
SET s.department_id = c.department_id;

-- Step 7: Verify all subjects have department_id populated
SELECT COUNT(*) as subjects_without_department 
FROM subjects 
WHERE department_id IS NULL;

-- Step 8: Make department_id NOT NULL after verification
ALTER TABLE subjects 
MODIFY COLUMN department_id INT NOT NULL;

-- Step 9: Add foreign key constraint for department_id
ALTER TABLE subjects 
ADD CONSTRAINT fk_subjects_department 
FOREIGN KEY (department_id) REFERENCES departments(id);

-- Step 10: Add index for department_id
ALTER TABLE subjects 
ADD INDEX idx_subjects_department_semester (department_id, semester);

-- Step 11: Remove old foreign key constraint for course_id
ALTER TABLE subjects 
DROP FOREIGN KEY fk_subjects_course;

-- Step 12: Remove old index for course_id
ALTER TABLE subjects 
DROP INDEX idx_subjects_course_semester;

-- Step 13: Drop the course_id column
ALTER TABLE subjects 
DROP COLUMN course_id;

-- Step 14: Final verification
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_subjects,
    COUNT(DISTINCT department_id) as unique_departments
FROM subjects;

-- Step 15: Show new table structure
SHOW CREATE TABLE subjects;

-- Step 16: Show data distribution by department
SELECT 
    d.name as department_name,
    COUNT(s.id) as subject_count
FROM subjects s
INNER JOIN departments d ON s.department_id = d.id
GROUP BY d.id, d.name
ORDER BY subject_count DESC;

-- Cleanup backup table (uncomment when you're sure migration is successful)
-- DROP TABLE subjects_backup;
