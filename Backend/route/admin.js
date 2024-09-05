const express = require('express');
const router = express.Router();
const promisePool = require('../Connection');

// API to add a user
router.post('/adduser', async (req, res) => {
  const { email, first_name, last_name, street1, street2, city, state, country, role: roleName, status = '0', ip = '0.0.0.0', created_on = new Date(), updated_on = new Date(), created_by = 'Admin', password } = req.body;

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

    // Check for existing email
    const [emailCheck] = await promisePool.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);
    if (emailCheck[0].count > 0) {
      await promisePool.query('ROLLBACK');
      return res.status(400).json({ message: 'Email is already in use. Please use a different email.' });
    }

    // Check for existing emp_id
    const [empIdCheck] = await promisePool.query('SELECT COUNT(*) AS count FROM users WHERE emp_id = ?', [email]); // Use email for emp_id check
    if (empIdCheck[0].count > 0) {
      await promisePool.query('ROLLBACK');
      return res.status(400).json({ message: 'emp_id is already in use. Please use a different emp_id.' });
    }

    // Get the next available emp_id
    const [result] = await promisePool.query('SELECT MAX(CAST(SUBSTRING(emp_id, 4) AS UNSIGNED)) AS max_id FROM users');
    const maxId = result[0].max_id || 0;
    const newEmpId = `Emp${maxId + 1}`;

    // Insert into users table
    await promisePool.query(
      `INSERT INTO users (email, emp_id, first_name, last_name, street1, street2, city, state, ip, country, role, status, created_on, updated_on, created_by, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, newEmpId, first_name, last_name, street1, street2, city, state, ip, country, roleId, status, created_on, updated_on, created_by, password]
    );

    await promisePool.query('COMMIT');
    res.status(201).json({ message: 'User data submitted successfully' });
  } catch (error) {
    await promisePool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error occurred while submitting data', error });
  }
});




// API to show all users with pagination, search, and sorting
router.get('/showalluser', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || ''; // Added role parameter
  const sortColumn = req.query.sort?.column || 'id';
  const sortOrder = req.query.sort?.order || 'asc';

  const offset = (page - 1) * limit;

  // Ensure sortColumn is valid to prevent SQL injection
  const validSortColumns = ['id', 'first_name', 'last_name', 'email', 'emp_id', 'role', 'country', 'state', 'city', 'last_login', 'status'];
  if (!validSortColumns.includes(sortColumn)) {
    return res.status(400).send('Invalid sort column');
  }

  // SQL query with JOINs, sorting, and role filtering
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
      u.status
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
        u.emp_id LIKE ? OR
        u.last_login LIKE ? OR
        u.status LIKE ?
      )
      AND (r.role LIKE ?)
    ORDER BY 
      ${sortColumn === 'last_login' ? 'u.last_login' : sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const searchPattern = `%${search}%`;

  try {
    // Fetch paginated, filtered, and sorted data
    const [rows] = await promisePool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, `%${role}%`, limit, offset]);

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
        AND (r.role LIKE ?)
    `;

    const [[{ total }]] = await promisePool.query(countQuery, [searchPattern, searchPattern, searchPattern, searchPattern, `%${role}%`]);

    res.json({
      users: rows,
      total
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});





// API to delete a user
router.delete('/deleteuser/:id', async (req, res) => {
  const { id } = req.params;

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

// API to get a specific user
router.get('/getuser/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/updateUser/:id', async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, emp_id, role: roleName, country, state, city, street1, street2 } = req.body;

  // Validate input
  if (!userId || !first_name || !last_name || !email || !emp_id || !roleName || !country || !state || !city || !street1 || !street2) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Define role mappings
  const roleMappings = {
    'Admin': 1,
    'HR': 2,
    'Employee': 3
  };

  // Map role name to role ID
  const roleId = roleMappings[roleName];
  if (roleId === undefined) {
    return res.status(400).json({ message: 'Invalid role provided. Valid roles are Admin, HR, Employee.' });
  }

  // Update query
  const updateQuery = `
    UPDATE users
    SET 
      first_name = ?, 
      last_name = ?, 
      email = ?, 
      emp_id = ?, 
      role = ?, 
      country = ?, 
      state = ?, 
      city = ?,
      street1=?,
      street2=?
    WHERE id = ?
  `;

  await promisePool.query(updateQuery, [first_name, last_name, email, emp_id, roleId, country, state, city, street1, street2, userId], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ message: 'Failed to update user.' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User updated successfully.' });
  });
});






// ==============================================================================================

router.get("/getattendance", async (req, res) => {
  try {
    // Fetch attendance records with user details, excluding those with user_id = 1
    const [attendanceRecords] = await promisePool.query(`
      SELECT 
        a.id AS id,
        a.user_id,
        a.in_time,
        a.out_time,
        a.date,
        a.comment,
        a.status,
        CONCAT(u.first_name, ' ', u.last_name) AS fullname
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE u.id <> 1
    `);

    // Respond with attendance records including user full names
    res.json({
      success: true,
      attendance: attendanceRecords
    });
  } catch (error) {
    console.error('Error fetching attendance and user details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



//============================================================================================

//attendance table apies

//add comment api
router.put("/savecomment/:id",async(req,res)=>{
  const id=req.params.id
  const {comment}=req.body
  const addcommentquery=("update attendance set comment =? where id =?")
  try{
await promisePool.query(addcommentquery,[comment,id])
res.json("The succefull added")
  }catch(error){
res.json("Error are occur",error)
  }
})


router.delete("/deleteattendance/:id",async(req,res)=>{
  const id=req.params.id
  const deletequery="DELETE FROM attendance where id =?"
  try{
    await promisePool.query(deletequery,[id])
    res.json("Succefull")
  }catch(error){
res.json("not delete succefull")
  }
})


router.put('/saverecord/:id', async (req, res) => {
  const id = req.params.id;
  const { in_time, out_time, date, status, comment } = req.body;

  // Build the SQL query dynamically
  let query = 'UPDATE attendance SET ';
  const values = [];
  
  if (in_time !== undefined) {
    query += 'in_time = ?, ';
    values.push(in_time);
  }
  if (out_time !== undefined) {
    query += 'out_time = ?, ';
    values.push(out_time);
  }
  if (date !== undefined) {
    query += 'date = ?, ';
    values.push(date);
  }
  if (status !== undefined) {
    query += 'status = ?, ';
    values.push(status);
  }
  if (comment !== undefined) {
    query += 'comment = ?, ';
    values.push(comment);
  }
  
  // Remove trailing comma and space
  query = query.slice(0, -2);
  query += ' WHERE id = ?';
  values.push(id);

  try {
    const [results] = await promisePool.query(query, values);
    res.json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error('Error updating record:', err);
    res.status(500).json({ success: false, message: 'Error updating record.' });
  }
});






module.exports = router;
