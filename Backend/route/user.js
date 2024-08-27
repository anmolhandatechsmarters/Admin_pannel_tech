const express = require('express');
const router = express.Router();
const promisePool = require('../Connection.js');
const jwt = require('jsonwebtoken');
const { authentication, authorize } = require('../middleware/auth.js');

// Get all users
router.get('/allusershow', async (req, res) => {
    try {
        const [rows] = await promisePool.query('SELECT * FROM users');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Submit new user data
router.post('/submitdata', async (req, res) => {
    const { email, first_name, last_name, street1, street2, city, state, country, role, status = '0', last_login = new Date(), user_agent, ip, created_on = new Date(), updated_on = new Date(), created_by = 'Admin', password } = req.body;

    // Ensure required fields are not null
    if (!email || !first_name || !last_name || !street1 || !city || !state || !country || !password) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }

    try {
        // Start transaction
        await promisePool.query('START TRANSACTION');

        // Insert into 'role' table
        const [roleResult] = await promisePool.query('INSERT INTO role (role) VALUES (?)', [role]);

        // Generate a unique emp_id based on role ID or other unique factor
        const emp_id = `Emp${roleResult.insertId}`;

        // Insert into 'users' table
        await promisePool.query(
            `INSERT INTO users (email, emp_id, first_name, last_name, street1, street2, city, state, country, role, status, last_login, user_agent, ip, created_on, updated_on, created_by, password) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, emp_id, first_name, last_name, street1, street2, city, state, country, roleResult.insertId, status, last_login, user_agent, ip, created_on, updated_on, created_by, password]
        );

        // Commit transaction
        await promisePool.query('COMMIT');
        res.status(201).json({ message: 'User data submitted successfully' });
    } catch (error) {
        // Rollback transaction in case of error
        await promisePool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Error occurred while submitting data', error });
    }
});

// Update user data
router.patch('/updatedata', async (req, res) => {
    const { id, ...update } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Id is required' });
    }

    try {
        const updateFields = Object.keys(update).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(update), id];

        const query = `UPDATE users SET ${updateFields} WHERE id = ?`;
        const [result] = await promisePool.query(query, values);

        res.status(200).json({ message: 'Data updated successfully', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while updating data', error });
    }
});

// Delete a user
router.delete('/deleteuser', async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Id is required' });
    }

    try {
        const [result] = await promisePool.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'User deleted successfully', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while deleting user', error });
    }
});

// Show roles from the database
router.get('/showroledatabase', async (req, res) => {
    try {
        const [rows] = await promisePool.query('SELECT * FROM role');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Query to find the user by email
        const [results] = await promisePool.query(
            `SELECT users.id, users.email, users.password, role.role 
             FROM users 
             JOIN role ON users.role = role.id 
             WHERE users.email = ?`,
            [email]
        );

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        // Compare the provided password with the stored password in the database
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last login time
        await promisePool.query('UPDATE users SET last_login = NOW() WHERE email = ?', [email]);

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'anmol', // Use environment variable for secret
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token,  // Send the JWT to the client
            user: { email: user.email, id: user.id, role: user.role }
        });
    } catch (error) {
        console.error(error);
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

module.exports = router;
