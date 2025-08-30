module.exports = (sequelize, DataTypes) => {
  const GuestTeacher = sequelize.define('GuestTeacher', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    employeeId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'employee_id'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id'
    },
    paymentType: {
      type: DataTypes.ENUM('hourly', 'per_class', 'per_session', 'monthly'),
      allowNull: false,
      defaultValue: 'hourly',
      field: 'payment_type'
    },
    rate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    qualification: {
      type: DataTypes.STRING(200)
    },
    phone: {
      type: DataTypes.STRING(15)
    },
    address: {
      type: DataTypes.TEXT
    },
    totalHoursTaught: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00,
      field: 'total_hours_taught'
    },
    totalSessionsTaught: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_sessions_taught'
    }
  }, {
    tableName: 'guest_teachers',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['departmentId'] }
    ]
  });

  GuestTeacher.associate = (models) => {
    GuestTeacher.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    GuestTeacher.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    GuestTeacher.hasMany(models.Class, { foreignKey: 'guestTeacherId', as: 'classes' });
    GuestTeacher.hasMany(models.Salary, { foreignKey: 'guestTeacherId', as: 'salaries' });
    GuestTeacher.hasMany(models.TeachingSession, { foreignKey: 'guestTeacherId', as: 'teachingSessions' });
  };

  return GuestTeacher;
};