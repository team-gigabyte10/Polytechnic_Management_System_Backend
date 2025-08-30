module.exports = (sequelize, DataTypes) => {
  const Salary = sequelize.define('Salary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    teacherId: {
      type: DataTypes.INTEGER,
      field: 'teacher_id'
    },
    guestTeacherId: {
      type: DataTypes.INTEGER,
      field: 'guest_teacher_id'
    },
    month: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    baseAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'base_amount'
    },
    overtimeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'overtime_amount'
    },
    bonus: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    hoursWorked: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00,
      field: 'hours_worked'
    },
    sessionsTaught: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sessions_taught'
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_paid'
    },
    paidDate: {
      type: DataTypes.DATEONLY,
      field: 'paid_date'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque'),
      defaultValue: 'bank_transfer',
      field: 'payment_method'
    }
  }, {
    tableName: 'salaries',
    indexes: [
      { fields: ['month'] },
      { fields: ['isPaid'] },
      { unique: true, fields: ['teacherId', 'month'] },
      { unique: true, fields: ['guestTeacherId', 'month'] }
    ],
    validate: {
      teacherXorGuestTeacher() {
        if ((this.teacherId && this.guestTeacherId) || (!this.teacherId && !this.guestTeacherId)) {
          throw new Error('Salary must be for either a teacher or a guest teacher, but not both');
        }
      }
    }
  });

  Salary.associate = (models) => {
    Salary.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    Salary.belongsTo(models.GuestTeacher, { foreignKey: 'guestTeacherId', as: 'guestTeacher' });
  };

  return Salary;
};