const express = require('express');
const router = express.Router();
const promisePool = require('../Connection'); // Update path as needed
const jwt = require('jsonwebtoken');
const { authentication, authorize } = require('../middleware/auth'); // Update path as needed
const { createTransport } = require("nodemailer");
const crypto = require('crypto');
const otpStore = {};

// Generate OTP function
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}


//httu fcbd cqba eici
var transporter = createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "anmolhanda@techsmarters.com",
    pass: "httu fcbd cqba eici"
  }
});


// Submit new user data for the registration page 
router.post('/submitdata', async (req, res) => {
  const { email, first_name, last_name, street1, street2, city, state, country, role: roleName, status = '0', last_login = new Date(), user_agent, ip, created_on = new Date(), updated_on = new Date(), created_by = 'Admin', password } = req.body;

  // Validate required fields
  if (!email || !first_name || !last_name || !street1 || !city || !state || !country || !password) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  // Define role mappings
  const roleMappings = {
    'Admin': 1,
    'HR': 2,
    'Employee': 3
  };

  // Validate and map role
  const roleId = roleMappings[roleName];
  if (!roleId) {
    return res.status(400).json({ message: 'Invalid role provided. Valid roles are Admin, HR, Employee.' });
  }

  try {
    await promisePool.query('START TRANSACTION');

    // Get the next available emp_id
    const [result] = await promisePool.query('SELECT MAX(CAST(SUBSTRING(emp_id, 4) AS UNSIGNED)) AS max_id FROM users');
    const maxId = result[0].max_id || 0;
    const newEmpId = `Emp${maxId + 1}`;

    // Insert into users table
    await promisePool.query(
      `INSERT INTO users (email, emp_id, first_name, last_name, street1, street2, city, state, country, role, status, last_login, user_agent, ip, created_on, updated_on, created_by, password) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, newEmpId, first_name, last_name, street1, street2, city, state, country, roleId, status, last_login, user_agent, ip, created_on, updated_on, created_by, password]
    );

    await promisePool.query('COMMIT');
    res.status(201).json({ message: 'User data submitted successfully' });
  } catch (error) {
    await promisePool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error occurred while submitting data', error });
  }
});


// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Fetch user data along with their current status
    const [results] = await promisePool.query(
      `SELECT users.id, users.email, users.password, users.status, role.role 
           FROM users 
           JOIN role ON users.role = role.id 
           WHERE users.email = ?`,
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Validate password (no hashing involved)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update user's lastLogin and status
    await promisePool.query(
      `UPDATE users 
           SET last_login = NOW(), status = '1' 
           WHERE id = ?`,
      [user.id]
    );

    // Insert attendance record
    await promisePool.query(
      `INSERT INTO attendance (user_id, in_time, date) 
           VALUES (?, NOW(), CURDATE())`,
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'anmol',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: { email: user.email, id: user.id, role: user.role }
    });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//logout user

router.put('/logout/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Update the out_time in attendance table
    await promisePool.query(
      `UPDATE attendance SET out_time = NOW() WHERE user_id = ? `,
      [userId]
    );

    // Update user status
    await promisePool.query(
      `UPDATE users SET status = '0' WHERE id = ?`,
      [userId]
    );

    // Fetch in_time and out_time
    const [attendanceRecords] = await promisePool.query(
      `SELECT in_time, out_time FROM attendance WHERE user_id = ? AND out_time IS NOT NULL`,
      [userId]
    );

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const { in_time, out_time } = attendanceRecords[0];

    // Calculate the duration between in_time and out_time
    const inTime = new Date(in_time);
    const outTime = new Date(out_time);
    const diffMs = outTime - inTime; // Difference in milliseconds
    const diffHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours

    // Update the status based on the calculated time
    let status = '';
    if (diffHours > 6) {
      status = 'Present';
    } else if (diffHours <= 6 && diffHours >= 4) {
      status = 'Halfday';
    } else {
      status = 'Absent';
    }

    await promisePool.query(
      `UPDATE attendance SET status = ? WHERE user_id = ? AND out_time IS NOT NULL`,
      [status, userId]
    );

    res.status(200).json({ message: 'Logout successful and attendance updated' });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






// Authentication routes
router.get('/user/admin', authentication, authorize(['Admin', 'Hr', 'Employee']), (req, res) => {
  res.json('Welcome admin');
});

router.get('/user/employee', authentication, authorize(['Employee']), (req, res) => {
  res.json('Welcome employee');
});

router.get('/user/hr', authentication, authorize(['Hr', 'Employee']), (req, res) => {
  res.json('Welcome HR');
});



//admin dashboard count total user
router.get("/totaluser", async (req, res) => {
  querys = "SELECT COUNT(*) AS count FROM users WHERE id <> 1"
  try {
    const [result] = await promisePool.query(querys)
    res.send(result[0].count.toString())
  } catch {
    res.send("error are occur")
  }
})


// admin dashboard count total  active user 
router.get("/allactiveuser", async (req, res) => {
  // Query to count active users, excluding user with id = 1
  const query = "SELECT COUNT(*) AS user_active FROM users WHERE status = '1' AND id <> 1";
  try {
    const [result] = await promisePool.query(query);
    res.send(result[0].user_active.toString());
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


//admin dashboard count total inactive user
router.get("/allinactiveuser", async (req, res) => {

  // Query to count inactive users, excluding user with id = 1
  const query = "SELECT COUNT(*) AS user_inactive FROM users WHERE status = '0' AND id <> 1";
  try {
    const [result] = await promisePool.query(query);
    res.send(result[0].user_inactive.toString());
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


//login page forget password
router.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await promisePool.query(query, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "No user found with that email." });
    }

    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP valid for 5 minutes

    const mailOptions = {
      from: "anmol@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ success: false, message: 'Error sending email.' });
      } else {
        console.log('Email sent:', info.response);
        return res.json({ success: true, message: 'Email sent successfully. Please check your email.' });
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

//forget password for otp verification
router.post("/verifyotp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = otpStore[email];

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found or expired." });
    }

    if (Date.now() > otpRecord.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP has expired." });
    }

    if (otp !== otpRecord.otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET || "defaultsecret", { expiresIn: '1h' });

    delete otpStore[email];

    return res.json({ success: true, token, message: "OTP verified successfully." });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// forget passwrod verfication token 
router.get('/verifyforgetpasswordtoken', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'anmol');
    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

//update password the for verifcation
router.post('/updatepassword', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and password must be provided.' });
    }

    const query = 'UPDATE users SET password = ? WHERE email = ?';
    const [result] = await promisePool.query(query, [newPassword, email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});



module.exports = router;

