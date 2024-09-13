const express=require("express")
const router=express.Router()
const {findemployeedetail,userattendance,MarkAttendance,UnmarkAttendance, Getattendance, GetUserAttendanceCount}=require('../Controller/employeeController')


router.get("/employeedetail/:id",findemployeedetail);

router.get("/userattendance/:id",userattendance);

router.post("/markattendance/:id",MarkAttendance);

router.put("/unmarkattendance/:id",UnmarkAttendance);

router.get("/getattendance/:id",Getattendance);




module.exports=router


