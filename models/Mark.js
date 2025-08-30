module.exports = (sequelize, DataTypes) => {
  const Mark = sequelize.define('Mark', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'subject_id'
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id'
    },
    examType: {
      type: DataTypes.ENUM('quiz', 'midterm', 'final', 'assignment', 'project'),
      allowNull: false,
      field: 'exam_type'
    },
    totalMarks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'total_marks'
    },
    obtainedMarks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'obtained_marks'
    },
    grade: {
      type: DataTypes.STRING(2)
    },
    examDate: {
      type: DataTypes.DATEONLY,
      field: 'exam_date'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      field: 'created_by'
    }
  }, {
    tableName: 'marks',
    indexes: [
      { fields: ['studentId', 'subjectId'] },
      { fields: ['examType'] },
      { fields: ['examDate'] }
    ]
  });

  Mark.associate = (models) => {
    Mark.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
    Mark.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
    Mark.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  };

  return Mark;
};