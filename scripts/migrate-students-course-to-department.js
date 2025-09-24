const { sequelize } = require('../config/database');

async function columnExists(tableName, columnName) {
  const [rows] = await sequelize.query(
    `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column LIMIT 1`,
    { replacements: { table: tableName, column: columnName } }
  );
  return rows.length > 0;
}

async function getForeignKeys(tableName, columnName) {
  const [rows] = await sequelize.query(
    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column AND REFERENCED_TABLE_NAME IS NOT NULL`,
    { replacements: { table: tableName, column: columnName } }
  );
  return rows.map(r => r.CONSTRAINT_NAME);
}

async function getIndexes(tableName, columnName) {
  const [rows] = await sequelize.query(
    `SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
    { replacements: { table: tableName, column: columnName } }
  );
  return rows.map(r => r.INDEX_NAME).filter(name => name && name.toLowerCase() !== 'primary');
}

async function migrate() {
  console.log('Starting migration: students.course_id -> students.department_id');
  await sequelize.authenticate();

  // 1) Ensure department_id exists
  const hasDepartmentId = await columnExists('students', 'department_id');
  if (!hasDepartmentId) {
    console.log('Adding column students.department_id ...');
    await sequelize.query(`ALTER TABLE students ADD COLUMN department_id INT NULL AFTER course_id`);
  } else {
    console.log('Column students.department_id already exists');
  }

  // 2) Populate department_id (if courses table exists)
  const coursesTableExists = await columnExists('courses', 'id');
  if (coursesTableExists) {
    console.log('Populating students.department_id from courses.department_id ...');
    await sequelize.query(
      `UPDATE students s INNER JOIN courses c ON s.course_id = c.id 
       SET s.department_id = c.department_id 
       WHERE s.department_id IS NULL`
    );
  } else {
    console.log('Courses table does not exist, skipping population step');
  }

  // 3) Make NOT NULL
  console.log('Setting students.department_id to NOT NULL ...');
  await sequelize.query(`ALTER TABLE students MODIFY COLUMN department_id INT NOT NULL`);

  // 4) Add FK if missing
  const [deptFkRows] = await sequelize.query(
    `SELECT 1 FROM information_schema.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' 
       AND COLUMN_NAME = 'department_id' AND REFERENCED_TABLE_NAME = 'departments' LIMIT 1`
  );
  
  if (deptFkRows.length === 0) {
    console.log('Adding foreign key fk_students_department ...');
    await sequelize.query(
      `ALTER TABLE students 
       ADD CONSTRAINT fk_students_department 
       FOREIGN KEY (department_id) REFERENCES departments(id)`
    );
  } else {
    console.log('Foreign key on students.department_id already exists');
  }

  // 5) Add index if missing
  const [deptSemIdxRows] = await sequelize.query(
    `SELECT 1 FROM information_schema.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' 
       AND INDEX_NAME = 'idx_students_department_semester' LIMIT 1`
  );
  
  if (deptSemIdxRows.length === 0) {
    console.log('Adding index idx_students_department_semester ...');
    await sequelize.query(
      `ALTER TABLE students ADD INDEX idx_students_department_semester (department_id, semester)`
    );
  } else {
    console.log('Index idx_students_department_semester already exists');
  }

  // 6) Drop FKs on course_id
  const fks = await getForeignKeys('students', 'course_id');
  for (const fk of fks) {
    console.log(`Dropping foreign key ${fk} on students.course_id ...`);
    await sequelize.query(`ALTER TABLE students DROP FOREIGN KEY \`${fk}\``);
  }

  // 7) Drop indexes on course_id
  const idxs = await getIndexes('students', 'course_id');
  for (const idx of idxs) {
    console.log(`Dropping index ${idx} on students.course_id ...`);
    await sequelize.query(`ALTER TABLE students DROP INDEX \`${idx}\``);
  }

  // 8) Drop column course_id if exists
  const hasCourseId = await columnExists('students', 'course_id');
  if (hasCourseId) {
    console.log('Dropping column students.course_id ...');
    await sequelize.query(`ALTER TABLE students DROP COLUMN course_id`);
  } else {
    console.log('Column students.course_id already removed');
  }

  console.log('Migration complete.');
  await sequelize.close();
}

if (require.main === module) {
  migrate().catch(async (err) => {
    console.error('Migration failed:', err && err.message ? err.message : err);
    try { await sequelize.close(); } catch (e) {}
    process.exit(1);
  });
}

module.exports = { migrate };
