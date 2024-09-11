module.exports = (sequelize, DataTypes) => {
    const State = sequelize.define('State', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      country_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Country',
          key: 'id',
        }
      },
    }, {
      tableName: 'State',
      timestamps: false,
    });
  
    State.associate = models => {
      State.belongsTo(models.Country, { foreignKey: 'country_id' });
    };
  
    return State;
  };
  