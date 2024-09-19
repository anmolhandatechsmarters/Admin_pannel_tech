const express =require("express")
const route=express.Router()
const {hrdata, hrcountemployee, hractiveemployee, hrinactiveemployee, gethremployeeattendance, getemployee, downloadattendanceuser}=require("../Controller/HrController")

route.get("/gethrdata/:id",hrdata);

//dashboard
route.get("/hrcountemployee",hrcountemployee);

route.get("/hractiveemployee",hractiveemployee);
route.get("/hrinactiveemployee",hrinactiveemployee);


//hr employee attendance 
route.get("/showemployeeattendance",gethremployeeattendance);


//router for user show
route.get("/showemployeeuser",getemployee)




module.exports=route