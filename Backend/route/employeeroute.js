const express=require("express")
const router=express.Router()
const {findemployeedetail,userattendance,MarkAttendance,UnmarkAttendance}=require('../Controller/employeeController')


router.get("/employeedetail/:id",findemployeedetail);

router.get("/userattendance/:id",userattendance)

router.put("/markattendance/:id",MarkAttendance)

router.put("/unmarkattendance/:id",UnmarkAttendance)
module.exports=router


