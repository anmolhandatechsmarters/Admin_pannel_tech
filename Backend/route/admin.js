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

router.get("/logs", userController.logs)



router.delete('/logdelete/:id', userController.deletelog)



//deparatment
router.post("/adddepartment", userController.adddepartment);
router.get("/getdeparmentdetail", userController.getdepartmentdetail)
router.put("/editdepartment/:id", userController.editdepartment)

router.delete('/deletedepartment/:id', userController.deletedepartment)

//designation

router.post("/adddesignation", userController.adddesignation);
router.get("/getdesignation", userController.getdesignation)
router.put("/editdesignation/:id", userController.editdesignation)
router.delete('/deletedesignation/:id', userController.deletedesignation)

router.get("/getadmindepartment", userController.getadmindepartment)
router.get("/getadmindesignation", userController.getadmindesignation)

router.get("/allattendancedownload", userController.allattendancedownload)
module.exports = router;
