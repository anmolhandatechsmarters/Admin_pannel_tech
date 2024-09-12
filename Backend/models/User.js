module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // Define attributes
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    emp_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    street1: DataTypes.STRING,
    street2: DataTypes.STRING,
    city: {
      type: DataTypes.INTEGER,
      references: {
        model: 'City',
        key: 'id',
      }
    },
    state: {
      type: DataTypes.INTEGER,
      references: {
        model: 'State',
        key: 'id',
      }
    },
    country: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Country',
        key: 'id',
      }
    },
    role: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Role',
        key: 'id',
      }
    },
    status: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
    },
    last_login: DataTypes.DATE,
    user_agent: DataTypes.STRING,
    ip: DataTypes.STRING,
    created_on: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_on: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
    created_by: DataTypes.STRING,
    password: DataTypes.STRING,
    Image: {
      type: DataTypes.STRING,
      defaultValue: 'uploads/efault.jpeg',

    },
  }, {
    tableName: 'User',
    timestamps: false,
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'role' });
    User.belongsTo(models.City, { foreignKey: 'city' });
    User.belongsTo(models.State, { foreignKey: 'state' });
    User.belongsTo(models.Country, { foreignKey: 'country' });
  };

  return User;
};
