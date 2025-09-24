module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'student', 'guest'),
      allowNull: false,
      defaultValue: 'student'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] }
    ]
  });

  User.associate = (models) => {
    User.hasOne(models.Student, { foreignKey: 'userId', as: 'studentProfile' });
    User.hasOne(models.Teacher, { foreignKey: 'userId', as: 'teacherProfile' });
    User.hasOne(models.GuestTeacher, { foreignKey: 'userId', as: 'guestTeacherProfile' });
    User.hasMany(models.Announcement, { foreignKey: 'createdBy', as: 'announcements' });
    User.hasMany(models.Mark, { foreignKey: 'createdBy', as: 'marksCreated' });
    User.hasMany(models.Expense, { foreignKey: 'addedBy', as: 'expensesAdded' });
    User.hasMany(models.Expense, { foreignKey: 'approvedBy', as: 'expensesApproved' });
  };

  return User;
};