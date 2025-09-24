module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
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
    rollNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'roll_number'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id'
    },

    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 8
      }
    },
    admissionYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'admission_year'
    },
    guardianName: {
      type: DataTypes.STRING(100),
      field: 'guardian_name'
    },
    guardianPhone: {
      type: DataTypes.STRING(15),
      field: 'guardian_phone'
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    additionalPhone: {
      type: DataTypes.STRING(15),
      field: 'additional_phone',
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT
    },
    feesPaid: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'fees_paid'
    }
  }, {
    tableName: 'students',
    indexes: [
      { fields: ['roll_number'] },
      { fields: ['department_id', 'semester'] },

      { fields: ['admission_year'] }
    ]
  });

  Student.associate = (models) => {
    Student.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Student.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });

    Student.hasMany(models.Attendance, { foreignKey: 'studentId', as: 'attendances' });
    Student.hasMany(models.Mark, { foreignKey: 'studentId', as: 'marks' });
    Student.hasMany(models.StudentPayment, { foreignKey: 'studentId', as: 'payments' });
    Student.hasMany(models.AttendanceRewardFine, { foreignKey: 'studentId', as: 'rewardsAndFines' });
  };

  return Student;
};