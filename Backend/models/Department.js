module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('departments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    department_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'departments',
    timestamps: true,
  });

  Department.associate = (models) => {
    Department.hasMany(models.users, { foreignKey: 'department_id', as: 'users' });
  };

  return Department;
};
