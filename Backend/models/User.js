module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
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
    department_id: { // Change department to department_id
      type: DataTypes.INTEGER,
      references: {
        model: 'departments', // Ensure this matches the actual table name
        key: 'id',
      },
    },
    designation_id: { // Change designation to designation_id
      type: DataTypes.INTEGER,
      references: {
        model: 'designations', // Ensure this matches the actual table name
        key: 'id',
      },
    },
    city: {
      type: DataTypes.INTEGER,
      references: {
        model: 'cities',
        key: 'id',
      },
    },
    state: {
      type: DataTypes.INTEGER,
      references: {
        model: 'states',
        key: 'id',
      },
    },
    country: {
      type: DataTypes.INTEGER,
      references: {
        model: 'countries',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.INTEGER,
      references: {
        model: 'roles',
        key: 'id',
      },
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
    image: {
      type: DataTypes.STRING,
      defaultValue: 'uploads/default.jpeg',
    },
  }, {
    tableName: 'users',
    timestamps: false,
  });

  User.associate = models => {
    User.belongsTo(models.cities, { foreignKey: 'city', as: 'cityDetails' });
    User.belongsTo(models.states, { foreignKey: 'state', as: 'stateDetails' });
    User.belongsTo(models.countries, { foreignKey: 'country', as: 'countryDetails' });
    User.belongsTo(models.roles, { foreignKey: 'role', as: 'roleDetails' });
    User.belongsTo(models.departments, { foreignKey: 'department_id', as: 'departmentDetails' }); // Add association for department
    User.belongsTo(models.designations, { foreignKey: 'designation_id', as: 'designationDetails' }); // Add association for designation
    User.hasMany(models.attendances, { foreignKey: 'user_id', as: 'attendances' });
  };

  return User;
};
