module.exports = (sequelize, DataTypes) => {
  const ClassSchedule = sequelize.define('ClassSchedule', {
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
      type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
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
      type: DataTypes.ENUM('theory', 'practical', 'lab', 'tutorial', 'seminar'),
      defaultValue: 'theory',
      field: 'class_type'
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 8
      }
    },
    academicYear: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'academic_year'
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      field: 'max_students'
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_recurring'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      field: 'end_date'
    },
    notes: {
      type: DataTypes.TEXT
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      field: 'updated_by'
    }
  }, {
    tableName: 'class_schedules',
    indexes: [
      { fields: ['subject_id'] },
      { fields: ['teacher_id'] },
      { fields: ['guest_teacher_id'] },
      { fields: ['schedule_day', 'start_time'] },
      { fields: ['academic_year', 'semester'] },
      { fields: ['room_number'] },
      { fields: ['is_active'] }
    ],
    validate: {
      teacherXorGuestTeacher() {
        if ((this.teacherId && this.guestTeacherId) || (!this.teacherId && !this.guestTeacherId)) {
          throw new Error('Class schedule must have either a teacher or a guest teacher, but not both');
        }
      },
      endDateAfterStartDate() {
        if (this.startDate && this.endDate && new Date(this.endDate) <= new Date(this.startDate)) {
          throw new Error('End date must be after start date');
        }
      },
      endTimeAfterStartTime() {
        if (this.startTime && this.endTime && this.endTime <= this.startTime) {
          throw new Error('End time must be after start time');
        }
      }
    }
  });

  ClassSchedule.associate = (models) => {
    ClassSchedule.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
    ClassSchedule.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    ClassSchedule.belongsTo(models.GuestTeacher, { foreignKey: 'guestTeacherId', as: 'guestTeacher' });
    ClassSchedule.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    ClassSchedule.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
    ClassSchedule.hasMany(models.Attendance, { foreignKey: 'classScheduleId', as: 'attendances' });
    ClassSchedule.hasMany(models.TeachingSession, { foreignKey: 'classScheduleId', as: 'teachingSessions' });
  };

  return ClassSchedule;
};
