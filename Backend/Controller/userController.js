const db = require('../Connection');
const { generateOTP } = require('../utils/otpUtils');
const { sendPasswordResetEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');
const Sequelize = require('sequelize');
let otpStore = {};

const createUser = async (req, res) => {
  const { email, first_name, last_name, street1, street2, city, state, country, role: roleName, status = '0', last_login = new Date(), user_agent, ip, created_on = new Date(), updated_on = new Date(), created_by = 'Admin', password } = req.body;

  if (!email || !first_name || !last_name || !street1 || !city || !state || !country || !password) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  const roleMappings = {
    'Admin': 1,
    'HR': 2,
    'Employee': 3
  };

  const roleId = roleMappings[roleName];
  if (!roleId) {
    return res.status(400).json({ message: 'Invalid role provided. Valid roles are Admin, HR, Employee.' });
  }

  try {
    await db.sequelize.transaction(async (transaction) => {
      const [result] = await db.sequelize.query('SELECT MAX(CAST(SUBSTRING(emp_id, 4) AS UNSIGNED)) AS max_id FROM users', { transaction });
      const maxId = result[0].max_id || 0;
      const newEmpId = `Emp${maxId + 1}`;

      await db.users.create({
        email,
        emp_id: newEmpId,
        first_name,
        last_name,
        street1,
        street2,
        city,
        state,
        country,
        role: roleId,
        status,
        last_login,
        user_agent,
        ip,
        created_on,
        updated_on,
        created_by,
        password
      }, { transaction });
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error occurred while creating user', error });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.query.ip
  const userAgent = req.query.userAgent
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await db.users.findOne({
      where: { email },
      include: [{ model: db.roles, as: 'roleDetails', attributes: ['id', 'role'] }]
    });

    if (!user || password !== user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update the last login time and status
    await db.users.update(
      { last_login: new Date(), status: '1', ip: ip, user_agent: userAgent },
      { where: { id: user.id } }
    );

    // Check if an attendance record exists for today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format

    const existingAttendance = await db.attendances.findOne({
      where: {
        user_id: user.id,
        date: todayString
      }
    });

    // If no record exists for today, create a new attendance record
    if (!existingAttendance) {
      await db.attendances.create({
        user_id: user.id,
        date: todayString,

      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, role: user.roleDetails.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        email: user.email,
        id: user.id,
        role: user.roleDetails.role
      }
    });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const logoutUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await db.users.update(
      { status: '0' },
      { where: { id: userId } }
    );

    res.status(200).json({ message: 'Logout successful and status updated' });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const totalUserCount = async (req, res) => {
  try {
    const [result] = await db.sequelize.query("SELECT COUNT(*) AS count FROM users WHERE id <> 1");
    res.status(200).send(result[0].count.toString());
  } catch (error) {
    console.error('Error fetching total user count:', error);
    res.status(500).send("Error occurred");
  }
};

const activeUserCount = async (req, res) => {
  try {
    const [result] = await db.sequelize.query("SELECT COUNT(*) AS user_active FROM users WHERE status = '1' AND id <> 1");
    res.status(200).send(result[0].user_active.toString());
  } catch (error) {
    console.error('Error fetching active user count:', error);
    res.status(500).send('Server Error');
  }
};

const inactiveUserCount = async (req, res) => {
  try {
    const [result] = await db.sequelize.query("SELECT COUNT(*) AS user_inactive FROM users WHERE status = '0' AND id <> 1");
    res.status(200).send(result[0].user_inactive.toString());
  } catch (error) {
    console.error('Error fetching inactive user count:', error);
    res.status(500).send('Server Error');
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email." });
    }

    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP valid for 5 minutes

    const success = await sendPasswordResetEmail(email, otp);

    if (!success) {
      return res.status(500).json({ success: false, message: 'Error sending email.' });
    }

    return res.json({ success: true, message: 'Email sent successfully. Please check your email.' });
  } catch (error) {
    console.error('Error during password reset request:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const verifyOTP = async (req, res) => {
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
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const verifyForgetPasswordToken = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password must be provided.' });
    }

    const [updateCount] = await db.users.update({ password: newPassword }, { where: { email } });

    if (updateCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


const downloadattendanceuser = async (req, res) => {
  const userId = req.params.id; // Get the user ID from the request parameters

  // Validate userId
  if (!userId) {
    return res.status(400).send('User ID is required.');
  }

  try {
    // Fetch attendance records for the specific user
    const results = await db.attendances.findAll({
      include: [{
        model: db.users,
        as: 'userDetails',
        attributes: ['first_name', 'last_name', 'email'], // Include required user details
        required: true
      }],
      where: {
        user_id: userId // Match attendance by user ID
      }
    });

    // Check if results are empty
    if (results.length === 0) {
      return res.status(404).send('No attendance records found for this user.');
    }

    // Transform the results to include user details
    const transformedResults = results.map(item => {
      const attendance = item.get({ plain: true });
      const user = attendance.userDetails;
      return {
        in_time: attendance.in_time,
        out_time: attendance.out_time,
        date: attendance.date,
        comment: attendance.comment,
        status: attendance.status,
        fullname: `${user.first_name} ${user.last_name}`,
        email: user.email
      };
    });

    // Convert results to CSV
    const csv = new Parser().parse(transformedResults);

    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.attachment('Attendance.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error querying the database');
  }
};


//=====================================================================
const userprofileget = async (req, res) => {
  const id = req.params.id;

  // Basic validation for the ID
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await db.users.findAll({
      where: { id: id },
      attributes: [
        'id', 'email', 'emp_id', 'first_name', 'last_name',
        'country', 'state', 'city', 'street1', 'street2',
        'last_login', 'status', 'image', 'department_id', 'designation_id',
        [Sequelize.col('roleDetails.role'), 'role'],
        [Sequelize.col('departmentDetails.department_name'), 'department'],
        [Sequelize.col('designationDetails.designation_name'), 'designation']
      ],
      include: [
        {
          model: db.roles,
          as: 'roleDetails',
          attributes: ['role'],
        },
        {
          model:db.departments,
          as:'departmentDetails',
          attributes:['department_name']

        },
        {
          model:db.designations,
          as:'designationDetails',
          attributes:['designation_name']

        },
        
        
        {
          model: db.cities,
          as: 'cityDetails',
          attributes: ['name'],
        },
        {
          model: db.states,
          as: 'stateDetails',
          attributes: ['name'],
        },
        {
          model: db.countries,
          as: 'countryDetails',
          attributes: ['name'],
        }
      ],
    });

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'An error occurred while fetching the user profile' });
  }
};


const useridcheck=async(req,res)=>{
  const { id } = req.params;


  try {
    const user = await users.findByPk(id); // Find user by primary key

    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = {
  createUser,
  loginUser,
  logoutUser,
  totalUserCount,
  activeUserCount,
  inactiveUserCount,
  forgotPassword,
  verifyOTP,
  verifyForgetPasswordToken,
  updatePassword,
  downloadattendanceuser,
  userprofileget,useridcheck
};
