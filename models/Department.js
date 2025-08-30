module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    headId: {
      type: DataTypes.INTEGER,
      field: 'head_id',
      references: {
        model: 'teachers',
        key: 'id'
      }
    }
  }, {
    tableName: 'departments',
    indexes: [
      { fields: ['code'] }
    ]
  });

  Department.associate = (models) => {
    Department.belongsTo(models.Teacher, { foreignKey: 'headId', as: 'head' });
    Department.hasMany(models.Course, { foreignKey: 'departmentId', as: 'courses' });
    Department.hasMany(models.Student, { foreignKey: 'departmentId', as: 'students' });
    Department.hasMany(models.Teacher, { foreignKey: 'departmentId', as: 'teachers' });
    Department.hasMany(models.GuestTeacher, { foreignKey: 'departmentId', as: 'guestTeachers' });
    Department.hasMany(models.Announcement, { foreignKey: 'departmentId', as: 'announcements' });
    Department.hasMany(models.Expense, { foreignKey: 'departmentId', as: 'expenses' });
  };

  return Department;
};