const { sequelize } = require('../config/database');
const models = require('../models');

async function syncCoreTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // Sync order matters for FKs: User -> Department -> Subject -> Teacher -> Student -> Class
    await models.User.sync({ alter: true });
    console.log('✅ users synced');

    await models.Department.sync({ alter: true });
    console.log('✅ departments synced');

    await models.Subject.sync({ alter: true });
    console.log('✅ subjects synced');

    await models.Teacher.sync({ alter: true });
    console.log('✅ teachers synced');

    await models.GuestTeacher.sync({ alter: true });
    console.log('✅ guest_teachers synced');

    await models.Student.sync({ alter: true });
    console.log('✅ students synced');

    await models.ClassSchedule.sync({ alter: true });
    console.log('✅ class schedules synced');

    await models.Attendance.sync({ alter: true });
    console.log('✅ attendance synced');

    await models.Mark.sync({ alter: true });
    console.log('✅ marks synced');

    await models.StudentPayment.sync({ alter: true });
    console.log('✅ student_payments synced');

    console.log('🎉 Core tables synced');
  } catch (err) {
    console.error('❌ Sync failed:', err && err.message ? err.message : err);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  syncCoreTables();
}

module.exports = { syncCoreTables };
