module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define('cities', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    state_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'states',
        key: 'id',
      },
    },
  }, {
    tableName: 'cities',
    timestamps: false,
  });

  City.associate = models => {
    City.belongsTo(models.states, { foreignKey: 'state_id', as: 'stateDetails' });
  };

  return City;
};
