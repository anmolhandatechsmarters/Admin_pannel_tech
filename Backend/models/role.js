const mongoose =require("mongoose")

const RoleSchema=new mongoose.Schema({
    id:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        enum:["Employee","HR","Admin"],
        default:"Employee"
    }
})

const RoleModel=mongoose.model("Role",RoleSchema)
module.exports=RoleModel