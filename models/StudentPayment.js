module.exports = (sequelize, DataTypes) => {
  const StudentPayment = sequelize.define('StudentPayment', {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentType: {
      type: DataTypes.ENUM('tuition_fee', 'admission_fee', 'exam_fee', 'library_fee', 'lab_fee', 'other'),
      allowNull: false,
      field: 'payment_type'
    },
    semester: {
      type: DataTypes.INTEGER
    },
    academicYear: {
      type: DataTypes.STRING(10),
      field: 'academic_year'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'online', 'cheque'),
      defaultValue: 'cash',
      field: 'payment_method'
    },
    transactionId: {
      type: DataTypes.STRING(100),
      field: 'transaction_id'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      field: 'due_date'
    },
    paidDate: {
      type: DataTypes.DATEONLY,
      field: 'paid_date'
    },
    lateFee: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00,
      field: 'late_fee'
    },
    discount: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00
    }
  }, {
    tableName: 'student_payments',
    indexes: [
      { fields: ['student_id', 'status'] },
      { fields: ['payment_type'] },
      { fields: ['due_date'] }
    ]
  });

  StudentPayment.associate = (models) => {
    StudentPayment.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
  };

  return StudentPayment;
};