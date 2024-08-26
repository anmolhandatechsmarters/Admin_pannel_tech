const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE
});

// SQL to create the table
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        emp_id VARCHAR(255) UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        street1 VARCHAR(255) NOT NULL,
        street2 VARCHAR(255),
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        status ENUM('0', '1') DEFAULT '0',
        last_login VARCHAR(255),
        user_agent VARCHAR(255),
        ip VARCHAR(255),
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by VARCHAR(255),
        password VARCHAR(255) NOT NULL
    );
`;

connection.connect((err) => {
    if (err) {
        console.log("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to database.");

    // Check and create table
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.log("Error creating table: " + err.message);
        } else {
            console.log("Table checked/created successfully.");
        }
    });
});

module.exports = connection;
