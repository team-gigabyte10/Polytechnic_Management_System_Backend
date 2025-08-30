module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'course_id'
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 8
      }
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    theoryHours: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      field: 'theory_hours'
    },
    practicalHours: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'practical_hours'
    }
  }, {
    tableName: 'subjects',
    indexes: [
      { fields: ['courseId', 'semester'] },
      { fields: ['code'] },
      { fields: ['credits'] }
    ]
  });

  Subject.associate = (models) => {
    Subject.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
    Subject.hasMany(models.Class, { foreignKey: 'subjectId', as: 'classes' });
    Subject.hasMany(models.Mark, { foreignKey: 'subjectId', as: 'marks' });
  };

  return Subject;
};