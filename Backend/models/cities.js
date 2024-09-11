module.exports = (sequelize, DataTypes) => {
    const City = sequelize.define('City', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      state_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'State',
          key: 'id',
        }
      },
    }, {
      tableName: 'City',
      timestamps: false,
    });
  
    City.associate = models => {
      City.belongsTo(models.State, { foreignKey: 'state_id' });
    };
  
    return City;
  };
  