module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
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
    designation: {
      type: DataTypes.STRING(50)
    },
    qualification: {
      type: DataTypes.STRING(200)
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'experience_years'
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    joiningDate: {
      type: DataTypes.DATEONLY,
      field: 'joining_date'
    },
    phone: {
      type: DataTypes.STRING(15)
    },
    address: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'teachers',
    indexes: [
      { fields: ['employee_id'] },
      { fields: ['department_id'] },
      { fields: ['joining_date'] }
    ]
  });

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Teacher.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    Teacher.hasMany(models.Class, { foreignKey: 'teacherId', as: 'classes' });
    Teacher.hasMany(models.Salary, { foreignKey: 'teacherId', as: 'salaries' });
    Teacher.hasOne(models.Department, { foreignKey: 'headId', as: 'headOfDepartment' });
  };

  return Teacher;
};