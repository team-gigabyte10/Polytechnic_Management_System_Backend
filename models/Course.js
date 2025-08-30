module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id'
    },
    durationYears: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      field: 'duration_years'
    }
  }, {
    tableName: 'courses',
    indexes: [
      { fields: ['department_id'] },
      { fields: ['code'] }
    ]
  });

  Course.associate = (models) => {
    Course.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    Course.hasMany(models.Student, { foreignKey: 'courseId', as: 'students' });
    Course.hasMany(models.Subject, { foreignKey: 'courseId', as: 'subjects' });
  };

  return Course;
};