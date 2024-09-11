const express = require('express');
const router = express.Router();
const { authentication, authorize } = require('../middleware/auth');
const {
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
} = require('../Controller/userController');

// User registration
router.post('/submitdata', createUser);

// User login
router.post('/login', loginUser);

// User logout
router.put('/logout/:id', logoutUser);

// Admin dashboard
router.get('/totaluser', totalUserCount);
router.get('/allactiveuser', activeUserCount);
router.get('/allinactiveuser', inactiveUserCount);

// Password reset
router.post('/forgetpassword', forgotPassword);
router.post('/verifyotp', verifyOTP);
router.get('/verifyforgetpasswordtoken', verifyForgetPasswordToken);
router.post('/updatepassword', updatePassword);

// Authentication routes
router.get('/user/admin', authentication, authorize(['Admin', 'HR', 'Employee']), (req, res) => {
  res.json('Welcome admin');
});
router.get('/user/employee', authentication, authorize(['Employee']), (req, res) => {
  res.json('Welcome employee');
});
router.get('/user/hr', authentication, authorize(['HR', 'Employee']), (req, res) => {
  res.json('Welcome HR');
});

module.exports = router;
