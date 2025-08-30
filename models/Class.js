module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
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
    teacherId: {
      type: DataTypes.INTEGER,
      field: 'teacher_id'
    },
    guestTeacherId: {
      type: DataTypes.INTEGER,
      field: 'guest_teacher_id'
    },
    roomNumber: {
      type: DataTypes.STRING(20),
      field: 'room_number'
    },
    scheduleDay: {
      type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'),
      allowNull: false,
      field: 'schedule_day'
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
    classType: {
      type: DataTypes.ENUM('theory', 'practical', 'lab'),
      defaultValue: 'theory',
      field: 'class_type'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'classes',
    indexes: [
      { fields: ['subjectId'] },
      { fields: ['teacherId'] },
      { fields: ['guestTeacherId'] },
      { fields: ['scheduleDay', 'startTime'] }
    ],
    validate: {
      teacherXorGuestTeacher() {
        if ((this.teacherId && this.guestTeacherId) || (!this.teacherId && !this.guestTeacherId)) {
          throw new Error('Class must have either a teacher or a guest teacher, but not both');
        }
      }
    }
  });

  Class.associate = (models) => {
    Class.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
    Class.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    Class.belongsTo(models.GuestTeacher, { foreignKey: 'guestTeacherId', as: 'guestTeacher' });
    Class.hasMany(models.Attendance, { foreignKey: 'classId', as: 'attendances' });
    Class.hasMany(models.TeachingSession, { foreignKey: 'classId', as: 'teachingSessions' });
  };

  return Class;
};