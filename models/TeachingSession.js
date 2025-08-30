module.exports = (sequelize, DataTypes) => {
  const TeachingSession = sequelize.define('TeachingSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    guestTeacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'guest_teacher_id'
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'class_id'
    },
    sessionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'session_date'
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'start_time'
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'end_time'
    },
    hoursTaught: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      field: 'hours_taught'
    },
    topicsCovered: {
      type: DataTypes.TEXT,
      field: 'topics_covered'
    },
    studentsPresent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'students_present'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    }
  }, {
    tableName: 'teaching_sessions',
    indexes: [
      { fields: ['guestTeacherId', 'sessionDate'] },
      { fields: ['classId', 'sessionDate'] }
    ]
  });

  TeachingSession.associate = (models) => {
    TeachingSession.belongsTo(models.GuestTeacher, { foreignKey: 'guestTeacherId', as: 'guestTeacher' });
    TeachingSession.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
  };

  return TeachingSession;
};