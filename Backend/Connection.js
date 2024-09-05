const mysql = require('mysql2');
require('dotenv').config();
const fs = require('fs');

// Create a pool of connections to the database
const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10, // Adjust connection limit based on your needs
    queueLimit: 0
});

const promisePool = pool.promise();

// Define SQL queries for creating tables
const createCountryTable = `
CREATE TABLE IF NOT EXISTS countries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sortname VARCHAR(2),
  name VARCHAR(255),
  phoneCode INT
);
`;

const createAttendanceTable = `
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  in_time TIME,
  out_time TIME,
  Date DATE NOT NULL,
  Comment VARCHAR(200) NULL,
  Status ENUM('present', 'Absent', 'Halfday'),
  FOREIGN KEY (user_id) REFERENCES users(id)

)
`;

const createStateTable = `
CREATE TABLE IF NOT EXISTS states (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  country_id INT,
  FOREIGN KEY (country_id) REFERENCES countries(id)
);
`;

const createCityTable = `
CREATE TABLE IF NOT EXISTS cities (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
      role INT NOT NULL CHECK (role IN (1, 2, 3)),
      status ENUM('0', '1') DEFAULT '0',
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      user_agent VARCHAR(255),
      ip VARCHAR(255) NOT NULL,
      created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(255),
      password VARCHAR(255) NOT NULL,
      FOREIGN KEY (role) REFERENCES role(id) ON DELETE RESTRICT
    );
  `;

// Function to execute a query
const executeQuery = async (query, values = []) => {
    try {
        const [results] = await promisePool.query(query, values);
        return results;
    } catch (err) {
        throw new Error(`Query failed: ${err.message}`);
    }
};

// Function to create tables
const createTables = async () => {
    try {
        await executeQuery(createCountryTable);
        await executeQuery(createStateTable);

        await executeQuery(createCityTable);
        await executeQuery(createRoleTable);

        await executeQuery(createUserTable);
        await executeQuery(createAttendanceTable)
        console.log("Tables checked/created successfully.");
    } catch (error) {
        console.error("Error creating tables:", error);
        throw error; // Rethrow error to handle it in the initialization function
    }
};

// Function to truncate tables
const truncateTables = async () => {
    try {
        await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
        await executeQuery('TRUNCATE TABLE cities');
        await executeQuery('TRUNCATE TABLE states');
        await executeQuery('TRUNCATE TABLE countries');
        await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
        console.log("Tables truncated successfully.");
    } catch (error) {
        console.error("Error truncating tables:", error);
        throw error; // Rethrow error to handle it in the initialization function
    }
};

// Function to insert data into tables
const insertData = async () => {
    try {
        await truncateTables();

        const citiesData = JSON.parse(fs.readFileSync('cities.json', 'utf8')).cities;
        const countriesData = JSON.parse(fs.readFileSync('countries.json', 'utf8')).countries;
        const statesData = JSON.parse(fs.readFileSync('states.json', 'utf8')).states;

        for (const country of countriesData) {
            await executeQuery('INSERT IGNORE INTO countries SET ?', country);
        }
        for (const state of statesData) {
            await executeQuery('INSERT IGNORE INTO states SET ?', state);
        }
        for (const city of citiesData) {
            await executeQuery('INSERT IGNORE INTO cities SET ?', city);
        }

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Error migrating data:', error);
        throw error; // Rethrow error to handle it in the initialization function
    }
};

// Main function to initialize the database
const initializeDatabase = async () => {
    try {
        console.log("Connecting to database...");
        await createTables();
        await insertData();
    } catch (err) {
        console.error("Database initialization failed: ", err.message);
    }
};

initializeDatabase();
module.exports = promisePool;
