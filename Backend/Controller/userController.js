const db = require('../Connection');
const { generateOTP } = require('../utils/otpUtils');
const { sendPasswordResetEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');
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
      const [result] = await db.sequelize.query('SELECT MAX(CAST(SUBSTRING(emp_id, 4) AS UNSIGNED)) AS max_id FROM User', { transaction });
      const maxId = result[0].max_id || 0;
      const newEmpId = `Emp${maxId + 1}`;

      await db.User.create({
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

    res.status(201).json({ message: 'User data submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while submitting data', error });
  }
};



const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find the user based on the email
    const user = await db.User.findOne({
      where: { email },
      include: [{
        model: db.Role,
        attributes: ['id', 'role']
      }]
    });

    // Validate user credentials
    if (!user || password !== user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login and status
    await db.User.update(
      { last_login: new Date(), status: '1' },
      { where: { id: user.id } }
    );

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Check if an attendance record for today already exists for the user
 
      // Create a new attendance record if none exists for today
      // await db.Attendance.create({
      //   user_id: user.id,
      //   date: today
      // })
      // console.log(`Added new attendance record for user_id ${user.id}`);
    
      

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, role: user.Role.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1h' }
    );

    // Send response with token and user details
    res.status(200).json({
      success: true,
      token,
      user: {
        email: user.email,
        id: user.id,
        role: user.Role.role
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
      

      await db.User.update(
        {status:"0"},{where:{id:userId}}
      )
     
      // const now = new Date();
      // await db.Attendance.update(
      //     { out_time: now },
      //     { where: { id: attendanceRecord.id } }
      // );

      
      // const { in_time } = await db.Attendance.findOne({
      //     where: { id: attendanceRecord.id }
      // });

      // const inTime = new Date(in_time);
      // const outTime = now; 
      // const diffMs = outTime - inTime;
      // const diffHours = diffMs / (1000 * 60 * 60); 

     
      // let status = '';
      // if (diffHours > 6) {
      //     status = 'Present';
      // } else if (diffHours <= 6 && diffHours >= 4) {
      //     status = 'Halfday';
      // } else {
      //     status = 'Absent';
      // }

      // await db.Attendance.update(
      //     { status },
      //     { where: { id: attendanceRecord.id } }
      // );

      res.status(200).json({ message: 'Logout successful and attendance updated'});
  } catch (error) {
      console.error('Internal server error:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


const totalUserCount = async (req, res) => {
  try {
    const [result] = await db.sequelize.query("SELECT COUNT(*) AS count FROM User WHERE id <> 1");
    res.send(result[0].count.toString());
  } catch (error) {
    res.status(500).send("Error occurred");
  }
};

const activeUserCount = async (req, res) => {
  try {
    const [result] = await db.sequelize.query("SELECT COUNT(*) AS user_active FROM User WHERE status = '1' AND id <> 1");
    res.send(result[0].user_active.toString());
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

const inactiveUserCount = async (req, res) => {
  try {
    const [result] = await db.sequelize.query("SELECT COUNT(*) AS user_inactive FROM User WHERE status = '0' AND id <> 1");
    res.send(result[0].user_inactive.toString());
  } catch (error) {
    res.status(500).send('Server Error');
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.User.findOne({ where: { email } });

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
    console.error('Error:', error);
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
    console.error('Error:', error);
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
      return res.status(400).json({ success: false, message: 'Email and password must be provided.' });
    }

    const result = await db.User.update({ password: newPassword }, { where: { email } });

    if (result[0] === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

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
  updatePassword
};
