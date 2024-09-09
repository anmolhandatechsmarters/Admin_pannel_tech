const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const UserRouter = require('./route/user.js');
const AdminRouter = require('./route/admin.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7001;

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  // Ensure that you have a valid database connection object
  if (global.connection) {
    global.connection.end((err) => {
      if (err) {
        console.error('Error disconnecting from the database:', err);
      } else {
        console.log('Successfully disconnected from the database');
      }
      process.exit();
    });
  } else {
    console.log('No database connection found, exiting.');
    process.exit();
  }
});
