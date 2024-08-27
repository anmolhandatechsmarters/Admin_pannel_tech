const mysql = require("mysql2");
require("dotenv").config();
const fs = require("fs");

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE
});

// SQL queries to create tables
const createCountryTable = `
CREATE TABLE IF NOT EXISTS countries (
  id INT PRIMARY KEY,
  sortname VARCHAR(2),
  name VARCHAR(255),
  phoneCode INT
);
`;

const createStateTable = `
CREATE TABLE IF NOT EXISTS states (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  country_id INT,
  FOREIGN KEY (country_id) REFERENCES countries(id)
);
`;

const createCityTable = `
CREATE TABLE IF NOT EXISTS cities (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  state_id INT,
  FOREIGN KEY (state_id) REFERENCES states(id)
);
`;

const createRoleTable = `
CREATE TABLE IF NOT EXISTS role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(255) NOT NULL
);
`;

const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  emp_id VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  street1 VARCHAR(255) NOT NULL,
  street2 VARCHAR(255),
  city INT NOT NULL,
  state INT NOT NULL,
  country INT NOT NULL,
  role INT,
  status ENUM('0', '1') DEFAULT '0',
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_agent VARCHAR(255),
  ip VARCHAR(255) NOT NULL,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  FOREIGN KEY (role) REFERENCES role(id)
);
`;

// Function to execute SQL queries
const executeQuery = (query, values = []) => {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Function to create tables
const createTables = async () => {
    try {
        await executeQuery(createCountryTable);
        await executeQuery(createStateTable);
        await executeQuery(createCityTable);
        await executeQuery(createRoleTable);
        await executeQuery(createUserTable);
        console.log("Tables checked/created successfully.");
    } catch (error) {
        console.error("Error creating tables:", error);
    }
};

// Function to truncate tables
const truncateTables = async () => {
    try {
        // Disable foreign key checks
        await executeQuery('SET FOREIGN_KEY_CHECKS = 0');

        // Truncate tables
        await executeQuery('TRUNCATE TABLE cities');
        await executeQuery('TRUNCATE TABLE states');
        await executeQuery('TRUNCATE TABLE countries');

        // Re-enable foreign key checks
        await executeQuery('SET FOREIGN_KEY_CHECKS = 1');

        console.log("Tables truncated successfully.");
    } catch (error) {
        console.error("Error truncating tables:", error);
    }
};

// Function to insert data
const insertData = async () => {
    try {
        // Truncate tables first
        await truncateTables();

        // Read and parse JSON files
        const citiesData = JSON.parse(fs.readFileSync('cities.json', 'utf8')).cities;
        const countriesData = JSON.parse(fs.readFileSync('countries.json', 'utf8')).countries;
        const statesData = JSON.parse(fs.readFileSync('states.json', 'utf8')).states;

        // Insert countries
        for (const country of countriesData) {
            await executeQuery('INSERT IGNORE INTO countries SET ?', country);
        }

        // Insert states
        for (const state of statesData) {
            await executeQuery('INSERT IGNORE INTO states SET ?', state);
        }

        // Insert cities
        for (const city of citiesData) {
            await executeQuery('INSERT IGNORE INTO cities SET ?', city);
        }

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Error migrating data:', error);
    } finally {
        connection.end();
    }
};

// Connect to the database and perform operations
connection.connect(async (err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to database.");

    // Create tables and then insert data
    await createTables();
    await insertData();
});





module.exports = connection

