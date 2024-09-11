const express=require("express")
const router=express.Router()
const promisePool = require('../Connection');
router.get("/getdata/:id",async(req,res)=>{
    const id=req.params.id
const query=`SELECT * FROM users where id = ?`
try{
    const [result]=await promisePool.query(query,[id])
    res.json(result[0])
}catch(error){
res.json(error)
}
})




module.exports=router


