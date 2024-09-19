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
  updatePassword, downloadattendanceuser
} = require('../Controller/userController');


router.post('/submitdata', createUser);


router.post('/login', loginUser);


router.put('/logout/:id', logoutUser);


router.get('/totaluser', totalUserCount);
router.get('/allactiveuser', activeUserCount);
router.get('/allinactiveuser', inactiveUserCount);


router.post('/forgetpassword', forgotPassword);
router.post('/verifyotp', verifyOTP);
router.get('/verifyforgetpasswordtoken', verifyForgetPasswordToken);
router.post('/updatepassword', updatePassword);


router.get('/user/admin', authentication, authorize(['Admin', 'HR', 'Employee']), (req, res) => {
  res.json('Welcome admin');
});
router.get('/user/employee', authentication, authorize(['Employee']), (req, res) => {
  res.json('Welcome employee');
});
router.get('/user/hr', authentication, authorize(['HR', 'Employee']), (req, res) => {
  res.json('Welcome HR');
});


//user download attendance
router.get("/attendancedownlaoduser/:id", downloadattendanceuser)



module.exports = router;
