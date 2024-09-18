const { departments, designations } = require("../Connection");

module.exports = (sequelize, DataTypes) => {
  const Designation = sequelize.define('designations', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    designation_name: {
      type: DataTypes.STRING,
      allowNull: false // You can set it to false if you want to ensure this field is always required
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'designations',
    timestamps: true,
  });

  return Designation;
};
