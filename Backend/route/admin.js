// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../Controller/adminController');
const multer = require('multer');

// Upload image route
router.put('/upload/:id', multer({ storage: userController.upload.storage }).single('image'), userController.uploadImage);

// Retrieve image route
router.get('/images/:id', userController.getImage);

// Add user route
router.post('/adduser', userController.addUser);

// Get all users route
router.get('/showalluser', userController.getAllUsers);

// Delete user route
router.delete('/deleteuser/:id', userController.deleteUser);

// Get specific user route
router.get('/getuser/:id', userController.getUser);

// Update user route
router.put('/updateUser/:id', userController.updateUser);
router.get('/getattendance', userController.getAttendance);
router.put('/savecomment/:id', userController.saveComment);
router.delete('/deleteattendance/:id', userController.deleteAttendance);
router.put('/saverecord/:id', userController.saveRecord);

router.get('/viewuser/:id', userController.viewUser);
router.get('/viewuserattendence/:id', userController.viewUserAttendance);

module.exports = router;
