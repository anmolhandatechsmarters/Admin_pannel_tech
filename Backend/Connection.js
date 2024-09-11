const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize instance
const sequelize = new Sequelize({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
  dialect: 'mysql',
  logging: false, // Disable logging for cleaner output
});

// Define models
const db = {
  Sequelize,
  sequelize,
  Country: require('./models/country')(sequelize, DataTypes),
  State: require('./models/states')(sequelize, DataTypes),
  City: require('./models/cities')(sequelize, DataTypes),
  Role: require('./models/role')(sequelize, DataTypes),
  User: require('./models/User')(sequelize, DataTypes),
  Attendance: require('./models/attendance')(sequelize, DataTypes),
};

// Define associations
const defineAssociations = () => {
  db.User.associate(db);
  db.Role.associate(db);
  db.City.associate(db);
  db.State.associate(db);
  db.Attendance.associate(db);
  // Add additional associations as needed
};

// Initialize associations
defineAssociations();

module.exports = db;
