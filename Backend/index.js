const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./Connection'); 
const UserRouter = require('./route/auth');
const AdminRouter = require('./route/admin');
const EmployeeRouter = require('./route/employeeroute')
const initializeDatabase = require('./initializeDatabase'); 
require('./cron.js');
const app = express();
const PORT = process.env.PORT || 7000;

// Define upload directory
const uploadDir = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define routes
app.use('/user', UserRouter);
app.use('/admin', AdminRouter);
app.use('/api/employee', EmployeeRouter);

// Start the server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start the server:', err);
    process.exit(1); 
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    // Close server
    db.close(() => {
      console.log('HTTP server closed.');
    });

    // Close database connection
    await sequelize.close();
    console.log('Database connection closed.');

    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
