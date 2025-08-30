module.exports = (sequelize, DataTypes) => {
  const AttendanceRewardFine = sequelize.define('AttendanceRewardFine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id'
    },
    type: {
      type: DataTypes.ENUM('reward', 'fine'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    reason: {
      type: DataTypes.STRING(255)
    },
    month: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    attendancePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'attendance_percentage'
    },
    isProcessed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_processed'
    }
  }, {
    tableName: 'attendance_rewards_fines',
    indexes: [
      { fields: ['studentId', 'month'] },
      { fields: ['type'] }
    ]
  });

  AttendanceRewardFine.associate = (models) => {
    AttendanceRewardFine.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
  };

  return AttendanceRewardFine;
};