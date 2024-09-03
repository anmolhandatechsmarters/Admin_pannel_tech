const express = require("express")
const router = express.Router()
const promisePool = require('../Connection');

router.post('/adduser', async (req, res) => {
  const { email, first_name, last_name, street1, street2, city, state, country, role, status = '0', ip = '0.0.0.0', created_on = new Date(), updated_on = new Date(), created_by = 'Admin', password } = req.body;

  // Validate required fields
  if (!email || !first_name || !last_name || !street1 || !city || !state || !country || !password) {
      return res.status(400).json({ message: 'Required fields are missing.' });
  }

  try {
      await promisePool.query('START TRANSACTION');

      // Insert into role table
      const [roleResult] = await promisePool.query('INSERT INTO role (role) VALUES (?)', [role]);

      // Generate employee ID
      const emp_id = `Emp${roleResult.insertId}`;

      // Insert into users table
      await promisePool.query(
          `INSERT INTO users (email, emp_id, first_name, last_name, street1, street2, city, state, ip, country, role, status, created_on, updated_on, created_by, password) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [email, emp_id, first_name, last_name, street1, street2, city, state, ip, country, roleResult.insertId, status, created_on, updated_on, created_by, password]
      );

      await promisePool.query('COMMIT');
      res.status(201).json({ message: 'User data submitted successfully' });
  } catch (error) {
      await promisePool.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ message: 'Error occurred while submitting data', error });
  }
});




router.get('/showalluser', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const sortColumn = req.query.sort?.column || 'id'; // Default to 'id'
  const sortOrder = req.query.sort?.order || 'asc'; // Default to 'asc'

  const offset = (page - 1) * limit;

  // Ensure sortColumn is valid to prevent SQL injection
  const validSortColumns = ['id', 'first_name', 'last_name', 'email', 'emp_id', 'role', 'country', 'state', 'city', 'last_login'];
  if (!validSortColumns.includes(sortColumn)) {
    return res.status(400).send('Invalid sort column');
  }

  // SQL query with JOINs and sorting
  const query = `
    SELECT 
      u.id, 
      u.email, 
      u.emp_id, 
      u.first_name, 
      u.last_name, 
      r.role AS role, 
      c.name AS country, 
      s.name AS state, 
      ci.name AS city, 
      u.street1, 
      u.street2, 
      u.last_login, 
      u.user_agent
    FROM 
      users u
    JOIN 
      role r ON u.role = r.id
    JOIN 
      countries c ON u.country = c.id
    JOIN 
      states s ON u.state = s.id
    JOIN 
      cities ci ON u.city = ci.id
    WHERE 
      u.id != 1
      AND (
        u.first_name LIKE ? OR
        u.last_name LIKE ? OR
        u.email LIKE ? OR
        u.emp_id LIKE ?
      )
    ORDER BY ?? ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const searchPattern = `%${search}%`;

  try {
    // Fetch paginated, filtered, and sorted data
    const [rows] = await promisePool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, sortColumn, limit, offset]);

    // Fetch total count for pagination information
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      JOIN 
        role r ON u.role = r.id
      JOIN 
        countries c ON u.country = c.id
      JOIN 
        states s ON u.state = s.id
      JOIN 
        cities ci ON u.city = ci.id
      WHERE 
        u.id != 1
        AND (
          u.first_name LIKE ? OR
          u.last_name LIKE ? OR
          u.email LIKE ? OR
          u.emp_id LIKE ?
        )
    `;

    const [[{ total }]] = await promisePool.query(countQuery, [searchPattern, searchPattern, searchPattern, searchPattern]);

    res.json({
      users: rows,
      total
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});



//edit delete api

router.delete('/deleteuser/:id', async (req, res) => {
    const { id } = req.params; // Extract id from URL parameters

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











// Update user endpoint
router.put('/updateuser/:id', async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, role, country, state, city } = req.body;

  try {
    // Validate that country, state, city, and role are valid
    // This validation might vary based on your schema
    const countryExists = await promisePool.query('SELECT * FROM countries WHERE id = ?', [country]);
    const stateExists = await promisePool.query('SELECT * FROM states WHERE id = ?', [state]);
    const cityExists = await promisePool.query('SELECT * FROM cities WHERE id = ?', [city]);
    const roleExists = ['HR','Employee'].includes(role);

    if (!countryExists.length || !stateExists.length || !cityExists.length || !roleExists) {
      return res.status(400).json({ message: 'Invalid country, state, city, or role' });
    }

    // Update the user record
    await promisePool.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ?, country = ?, state = ?, city = ? WHERE id = ?',
      [first_name, last_name, email, role, country, state, city, userId]);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put("/update/:id")







module.exports = router