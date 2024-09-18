const db = require('./Connection');
const fs = require('fs');

const createTables = async () => {
  try {
    await db.sequelize.sync({ force: false });
    console.log("Tables checked/created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

const truncateTables = async () => {
  try {
    await db.sequelize.transaction(async (transaction) => {
      await db.cities.destroy({ where: {}, transaction });
      await db.states.destroy({ where: {}, transaction });
      await db.countries.destroy({ where: {}, transaction });
    });
    console.log("Tables truncated successfully.");
  } catch (error) {
    console.error("Error truncating tables:", error);
    throw error;
  }
};

const hasData = async () => {
  try {
    console.log("Checking if data exists...");
    const [citiesCount, statesCount, countriesCount] = await Promise.all([
      db.cities.count(),
      db.states.count(),
      db.countries.count()
    ]);

    console.log(`Counts - Cities: ${citiesCount}, States: ${statesCount}, Countries: ${countriesCount}`);
    return citiesCount > 0 || statesCount > 0 || countriesCount > 0;
  } catch (error) {
    console.error('Error checking data:', error);
    throw error;
  }
};

const insertData = async () => {
  try {
    if (await hasData()) {
      console.log('Data already exists. Skipping data insertion.');
      return;
    }

    await truncateTables();

    const citiesData = JSON.parse(fs.readFileSync('cities.json', 'utf8')).cities;
    const countriesData = JSON.parse(fs.readFileSync('countries.json', 'utf8')).countries;
    const statesData = JSON.parse(fs.readFileSync('states.json', 'utf8')).states;

    for (const country of countriesData) {
      await db.countries.findOrCreate({ where: country });
    }
    for (const state of statesData) {
      await db.states.findOrCreate({ where: state });
    }
    for (const city of citiesData) {
      await db.cities.findOrCreate({ where: city });
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error migrating data:', error);
    throw error;
  }
};

const initializeDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await createTables();
    await insertData();
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1); // Exit with failure code
  }
};

module.exports = initializeDatabase;
