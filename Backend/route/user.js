const express = require("express");
const router = express.Router();
const connection = require("../Connection.js");
const jwt =require("jsonwebtoken")
const {authentication,authorize}=require("../middleware/auth.js")
// Get all users




router.get("/allusershow", (req, res) => {
    connection.query("SELECT * FROM users", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal server error" });
        }
        return res.status(200).json(result);
    });
});

// Submit new user data
router.post("/submitdata", (req, res) => {
    const getip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { email, emp_id, first_name, last_name, street1, street2, city, state, country, role = null, status = '0', last_login = new Date(), user_agent = "chrome", ip =getip, created_on = new Date(), update_on = new Date(), create_by = "sdf", password } = req.body;

    // Ensure required fields are not null
    if (!first_name || !last_name || !email || !password || !street1 || !city || !state || !country) {
        return res.status(400).json({ message: "Required fields are missing." });
    }

    const query = "INSERT INTO users (email, emp_id, first_name, last_name, street1, street2, city, state, country, role, status, last_login, user_agent, ip, created_on, update_on, create_by, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    connection.query(query, [email, emp_id, first_name, last_name, street1, street2, city, state, country, role, status, last_login, user_agent, ip, created_on, update_on, create_by, password], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Error occurred while submitting data", error });
        }
        return res.status(201).json({ message: "User data submitted successfully", result });
    });
});
// Update user data
router.patch("/updatedata", (req, res) => {
    const { id, ...update } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Id is required" });
    }
    const updateFields = Object.keys(update).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(update), id];

    const query = `UPDATE users SET ${updateFields} WHERE id = ?`;
    connection.query(query, values, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Error occurred while updating data", error });
        }
        return res.status(200).json({ message: "Data updated successfully", result });
    });
});

// Delete a user
router.delete("/deleteuser", (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Id is required" });
    }
    const query = "DELETE FROM users WHERE id = ?";
    connection.query(query, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Error occurred while deleting user", error });
        }
        return res.status(200).json({ message: "User deleted successfully", result });
    });
});

// Show roles from the database
router.get("/showroledatabase", (req, res) => {
    connection.query("SELECT * FROM userrole", (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
        return res.status(200).json(result);
    });
});

// Login user
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Query to find the user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];

        // Compare the provided password with the stored password in the database
        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Update last login time
        const updateQuery = 'UPDATE users SET last_login = NOW() WHERE email = ?';
        connection.query(updateQuery, [email], (updateError) => {
            if (updateError) {
                console.error(updateError);
                return res.status(500).json({ message: "Failed to update last login time" });
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user.id, role: user.role },
                'anmol',
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                success: true,
                token: token,  // Send the JWT to the client
                user: { email: user.email, id: user.id, role: user.role }
            });
        });
    });
});



//authentication 
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
