module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('countries', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sortname: DataTypes.STRING,
    name: DataTypes.STRING,
    phoneCode: DataTypes.INTEGER,
  }, {
    tableName: 'countries',
    timestamps: false,
  });

  return Country;
};
