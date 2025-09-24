module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define('Announcement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    targetAudience: {
      type: DataTypes.ENUM('all', 'students', 'teachers', 'staff', 'department'),
      allowNull: false,
      defaultValue: 'all',
      field: 'target_audience'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      field: 'department_id'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by'
    },
    expiresAt: {
      type: DataTypes.DATE,
      field: 'expires_at'
    }
  }, {
    tableName: 'announcements',
    indexes: [
      { fields: ['target_audience'] },
      { fields: ['created_at'] },
      { fields: ['expires_at'] }
    ]
  });

  Announcement.associate = (models) => {
    Announcement.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Announcement.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  };

  return Announcement;
};