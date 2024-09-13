const {Sequelize,Op}=require("sequelize")
const db=require("../Connection")

const hrdata=async(req,res)=>{
    const id = req.params.id;
  
    try {
      const user = await db.User.findOne({
        where: { id: id },
        include: [
          {
            model: db.Role,
            attributes: ['id', 'role'] 
          },{
            model:db.Attendance,
            attributes:['in_time','out_time','date'],
          }
        ]
      });
  
      if (user) {
        res.json({ success: true, user });
      } else {
        res.json({ success: false, message: "No user found" }); // Adjusted message and response structure
      }
    } catch (error) {
      console.error("Error fetching user details:", error); // Log the error for debugging
      res.status(500).json({ success: false, message: "Internal Server Error", error: error.message }); // Include error message in response
    }
}






module.exports={
hrdata,
}