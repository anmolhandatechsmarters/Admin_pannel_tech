module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('states', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    country_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'countries',
        key: 'id',
      },
    },
  }, {
    tableName: 'states',
    timestamps: false,
  });

  State.associate = models => {
    State.belongsTo(models.countries, { foreignKey: 'country_id', as: 'countryDetails' });
    State.hasMany(models.cities, { foreignKey: 'state_id', as: 'cities' });
  };

  return State;
};
