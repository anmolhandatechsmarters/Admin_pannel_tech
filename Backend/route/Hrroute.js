const express =require("express")
const route=express.Router()
const {hrdata}=require("../Controller/HrController")

route.get("/gethrdata/:id",hrdata);


module.exports=route