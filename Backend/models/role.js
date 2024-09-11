module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    // Define attributes
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false, // Ensure role field cannot be null
    },
  }, {
    tableName: 'Role',
    timestamps: false,
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'role', as: 'Users' });
  };

  return Role;
};
