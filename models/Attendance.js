module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    classScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'class_schedule_id'
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late'),
      allowNull: false,
      defaultValue: 'absent'
    },
    markedBy: {
      type: DataTypes.INTEGER,
      field: 'marked_by'
    },
    markedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'marked_at'
    }
  }, {
    tableName: 'attendance',
    indexes: [
      { fields: ['student_id', 'date'] },
      { fields: ['class_schedule_id', 'date'] },
      { unique: true, fields: ['class_schedule_id', 'student_id', 'date'] }
    ]
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.ClassSchedule, { foreignKey: 'classScheduleId', as: 'classSchedule' });
    Attendance.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
    Attendance.belongsTo(models.User, { foreignKey: 'markedBy', as: 'markedByUser' });
  };

  return Attendance;
};