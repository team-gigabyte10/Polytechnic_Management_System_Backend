const { sequelize } = require('../config/database');
const models = require('../models');

async function syncCoreTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // Sync order matters for FKs: User -> Department -> Course -> Teacher -> Student
    await models.User.sync({ alter: true });
    console.log('✅ users synced');

    await models.Department.sync({ alter: true });
    console.log('✅ departments synced');

    await models.Course.sync({ alter: true });
    console.log('✅ courses synced');

    await models.Teacher.sync({ alter: true });
    console.log('✅ teachers synced');

    await models.Student.sync({ alter: true });
    console.log('✅ students synced');

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
