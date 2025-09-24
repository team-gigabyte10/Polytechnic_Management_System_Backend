const { sequelize } = require('../config/database');

async function migrate() {
  console.log('Making student phone fields nullable...');
  await sequelize.authenticate();

  try {
    // Make guardian_phone nullable
    console.log('Making guardian_phone nullable...');
    await sequelize.query(`ALTER TABLE students MODIFY COLUMN guardian_phone VARCHAR(15) NULL`);
    
    // Make additional_phone nullable
    console.log('Making additional_phone nullable...');
    await sequelize.query(`ALTER TABLE students MODIFY COLUMN additional_phone VARCHAR(15) NULL`);
    
    // Make phone nullable (if not already)
    console.log('Making phone nullable...');
    await sequelize.query(`ALTER TABLE students MODIFY COLUMN phone VARCHAR(15) NULL`);
    
    // Make guardian_name nullable (if not already)
    console.log('Making guardian_name nullable...');
    await sequelize.query(`ALTER TABLE students MODIFY COLUMN guardian_name VARCHAR(100) NULL`);
    
    // Make address nullable (if not already)
    console.log('Making address nullable...');
    await sequelize.query(`ALTER TABLE students MODIFY COLUMN address TEXT NULL`);

    console.log('Migration complete - all phone fields are now nullable.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  migrate().catch(async (err) => {
    console.error('Migration failed:', err && err.message ? err.message : err);
    try { await sequelize.close(); } catch (e) {}
    process.exit(1);
  });
}

module.exports = { migrate };
