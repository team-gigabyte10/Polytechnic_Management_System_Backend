module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('salary', 'utilities', 'maintenance', 'equipment', 'supplies', 'transport', 'marketing', 'other'),
      allowNull: false
    },
    expenseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'expense_date'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque', 'online'),
      defaultValue: 'cash',
      field: 'payment_method'
    },
    receiptNumber: {
      type: DataTypes.STRING(50),
      field: 'receipt_number'
    },
    vendorName: {
      type: DataTypes.STRING(100),
      field: 'vendor_name'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      field: 'department_id'
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      field: 'approved_by'
    },
    addedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'added_by'
    }
  }, {
    tableName: 'expenses',
    indexes: [
      { fields: ['category', 'expenseDate'] },
      { fields: ['expenseDate'] },
      { fields: ['departmentId'] },
      { fields: ['vendorName'] }
    ]
  });

  Expense.associate = (models) => {
    Expense.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    Expense.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
    Expense.belongsTo(models.User, { foreignKey: 'addedBy', as: 'creator' });
  };

  return Expense;
};