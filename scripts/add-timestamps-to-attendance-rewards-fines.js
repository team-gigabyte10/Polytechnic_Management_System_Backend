/**
 * Migration script to add timestamp columns to attendance_rewards_fines table
 * Run this script to fix the "Unknown column 'updated_at'" error
 */

const { sequelize } = require('../config/database');

async function addTimestampsToAttendanceRewardsFines() {
  try {
    console.log('🔄 Starting migration: Adding timestamps to attendance_rewards_fines table...');

    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'attendance_rewards_fines' 
      AND COLUMN_NAME IN ('created_at', 'updated_at')
    `);

    const existingColumns = results.map(row => row.COLUMN_NAME);
    
    if (existingColumns.includes('created_at') && existingColumns.includes('updated_at')) {
      console.log('✅ Timestamp columns already exist. Migration not needed.');
      return;
    }

    // Add created_at column if it doesn't exist
    if (!existingColumns.includes('created_at')) {
      await sequelize.query(`
        ALTER TABLE attendance_rewards_fines 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Added created_at column');
    }

    // Add updated_at column if it doesn't exist
    if (!existingColumns.includes('updated_at')) {
      await sequelize.query(`
        ALTER TABLE attendance_rewards_fines 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ Added updated_at column');
    }

    // Add indexes for better performance
    try {
      await sequelize.query(`
        CREATE INDEX idx_attendance_rewards_fines_created_at ON attendance_rewards_fines(created_at)
      `);
      console.log('✅ Added created_at index');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️  created_at index already exists');
      } else {
        throw error;
      }
    }

    try {
      await sequelize.query(`
        CREATE INDEX idx_attendance_rewards_fines_updated_at ON attendance_rewards_fines(updated_at)
      `);
      console.log('✅ Added updated_at index');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️  updated_at index already exists');
      } else {
        throw error;
      }
    }

    console.log('🎉 Migration completed successfully!');
    console.log('📝 The attendance API should now work without the "Unknown column" error.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
if (require.main === module) {
  addTimestampsToAttendanceRewardsFines();
}

module.exports = addTimestampsToAttendanceRewardsFines;
