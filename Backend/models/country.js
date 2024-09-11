module.exports = (sequelize, DataTypes) => {
    const Country = sequelize.define('Country', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sortname: DataTypes.STRING,
      name: DataTypes.STRING,
      phoneCode: DataTypes.INTEGER,
    }, {
      tableName: 'Country',
      timestamps: false,
    });
  
    return Country;
  };
  