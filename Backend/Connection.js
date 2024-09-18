const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
  dialect: 'mysql',
  logging: false,
});

// Define models
const db = {
  Sequelize,
  sequelize,
  countries: require('./models/country')(sequelize, DataTypes),
  states: require('./models/states')(sequelize, DataTypes),
  cities: require('./models/cities')(sequelize, DataTypes),
  roles: require('./models/role')(sequelize, DataTypes),
  users: require('./models/User')(sequelize, DataTypes),
  attendances: require('./models/attendance')(sequelize, DataTypes),
  logs: require('./models/log')(sequelize, DataTypes),
  departments: require('./models/Department')(sequelize, DataTypes),
  designations: require('./models/Designation')(sequelize, DataTypes),
};

// Define associations
const defineAssociations = () => {
  if (db.users && typeof db.users.associate === 'function') db.users.associate(db);
  if (db.roles && typeof db.roles.associate === 'function') db.roles.associate(db);
  if (db.cities && typeof db.cities.associate === 'function') db.cities.associate(db);
  if (db.states && typeof db.states.associate === 'function') db.states.associate(db);
  if (db.attendances && typeof db.attendances.associate === 'function') db.attendances.associate(db);
  if (db.departments && typeof db.departments.associate === 'function') db.departments.associate(db);
  if (db.designations && typeof db.designations.associate === 'function') db.designations.associate(db);
};

// Initialize associations
defineAssociations();

module.exports = db;
