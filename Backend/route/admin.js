// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../Controller/adminController');
const multer = require('multer');


router.put('/upload/:id', multer({ storage: userController.upload.storage }).single('image'), userController.uploadImage);


router.get('/images/:id', userController.getImage);


router.post('/adduser', userController.addUser);


router.get('/showalluser', userController.getAllUsers);


router.delete('/deleteuser/:id', userController.deleteUser);


router.get('/getuser/:id', userController.getUser);


router.put('/updateUser/:id', userController.updateUser);
router.get('/getattendance', userController.getAttendance);
router.put('/savecomment/:id', userController.saveComment);
router.delete('/deleteattendance/:id', userController.deleteAttendance);
router.put('/saverecord/:id', userController.saveRecord);

router.get('/viewuser/:id', userController.viewUser);
router.get('/viewuserattendence/:id', userController.viewUserAttendance);

module.exports = router;
