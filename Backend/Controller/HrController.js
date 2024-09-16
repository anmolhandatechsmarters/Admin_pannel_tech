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


const hrcountemployee=async(req,res)=>{
try{
const employeecount=await db.User.count({
where:{role:"3"}
})
res.json(employeecount)
}catch(error){
res.json(error)
}
}

const hractiveemployee=async(req,res)=>{
  try{
const result=await db.User.count({
where:{role:"3",status:"1"}
})
res.json(result)
  }catch(error){
    res.json(error)
  }
}

const hrinactiveemployee=async(req,res)=>{
  try{
const result=await db.User.count({
where:{role:"3",status:"0"}
})
res.json(result)
  }catch(error){
    res.json(error)
  }
}

//attendance

 // Ensure Sequelize and Op are imported if not already

 const gethremployeeattendance = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const userId = parseInt(req.query.userId) || null;
  const sortColumn = req.query.sort?.column || 'id';
  const sortOrder = req.query.sort?.order || 'asc';
  const month = parseInt(req.query.month) || null;
  const year = parseInt(req.query.year) || null;
  const startDate = req.query.startDate || null;
  const endDate = req.query.endDate || null;
  const status = req.query.status || null;
  const offset = (page - 1) * limit;

  const validSortColumns = ['id', 'in_time', 'out_time', 'date'];
  if (!validSortColumns.includes(sortColumn)) {
      return res.status(400).json({ message: 'Invalid sort column' });
  }

  try {
      // Fetch all attendance records with user roles
      const attendanceRecords = await db.Attendance.findAll({
          include: {
              model: db.User,
              attributes: ['first_name', 'last_name', 'emp_id', 'role'], // Include role in attributes
              required: true
          },
          attributes: [
              'id', 'user_id', 'in_time', 'out_time', 'date', 'comment', 'status',
              [Sequelize.literal(`CONCAT(User.first_name, ' ', User.last_name, '(', User.emp_id, ')')`), 'fullname']
          ],
          where: {
              [Op.and]: [
                  userId ? { user_id: userId } : {},
                  search ? {
                      [Op.or]: [
                          { '$User.first_name$': { [Op.like]: `%${search}%` } },
                          { '$User.last_name$': { [Op.like]: `%${search}%` } },
                          { '$User.emp_id$': { [Op.like]: `%${search}%` } }
                      ]
                  } : {},
                  month ? Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month) : {},
                  status ? { status } : {},
                  year ? Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year) : {},
                  startDate ? { date: { [Op.gte]: startDate } } : {},
                  endDate ? { date: { [Op.lte]: endDate } } : {}
              ]
          },
          order: [
              [sortColumn, sortOrder]
          ],
          limit,
          offset
      });

      // Filter out records where user role is "Admin" and user_id is 1
      const filteredRecords = attendanceRecords.filter(record => {
          const userRole = record.User.role; // Access the role from the included User model
          // Access the user_id from the Attendance model

          // Exclude records where role is "Admin" and user_id is 1
          if (userRole === 1 || userRole === 2) {
              return false;
          }
          return true;
      });

      // Count total records for pagination
      const total = await db.Attendance.count({
          include: {
              model: db.User,
              attributes: []
          },
          where: {
              [Op.and]: [
                  userId ? { user_id: userId } : {},
                  search ? {
                      [Op.or]: [
                          { '$User.first_name$': { [Op.like]: `%${search}%` } },
                          { '$User.last_name$': { [Op.like]: `%${search}%` } },
                          { '$User.emp_id$': { [Op.like]: `%${search}%` } }
                      ]
                  } : {},
                  month ? Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month) : {},
                  status ? { status } : {},
                  year ? Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year) : {},
                  startDate ? { date: { [Op.gte]: startDate } } : {},
                  endDate ? { date: { [Op.lte]: endDate } } : {}
              ]
          }
      });

      res.json({
          success: true,
          attendance: filteredRecords,
          total
      });
  } catch (error) {
      console.error('Error fetching attendance records:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



//employee table

const getemployee = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const sortColumn = req.query.sort?.column || 'id';
  const sortOrder = req.query.sort?.order || 'asc';

  const offset = (page - 1) * limit;

  const validSortColumns = ['id', 'first_name', 'last_name', 'email', 'emp_id', 'role', 'country', 'state', 'city', 'last_login', 'status'];
  if (!validSortColumns.includes(sortColumn)) {
      return res.status(400).json({ message: 'Invalid sort column' });
  }

  try {
      const users = await db.User.findAll({
          attributes: [
              'id', 'email', 'emp_id', 'first_name', 'last_name', 'country', 'state', 'city', 'street1', 'street2', 'last_login', 'status',
              [Sequelize.col('Role.role'), 'role']  // Include role name from Role table
          ],
          include: [
              {
                  model: db.Role,
                  attributes: ['role'],  // Include role column for filtering
              }
          ],
          where: {
              [Sequelize.Op.and]: [
                  Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), { [Sequelize.Op.like]: `%${search}%` }),
                  role ? Sequelize.where(Sequelize.col('Role.role'), { [Sequelize.Op.like]: `%${role}%` }) : {}, // Adjust if needed
                  { emp_id: { [Sequelize.Op.ne]: 'admin' } },  // Exclude users with emp_id 'admin'
                  { '$Role.id$': { [Sequelize.Op.notIn]: [1, 2] } }  // Exclude users with roles 1 or 2
              ],
          },
          order: [[sortColumn, sortOrder]],
          limit,
          offset,
      });

      const total = await db.User.count({
          include: [
              {
                  model: db.Role,
                  attributes: []  // Exclude role columns from Role table in results, only include role_name
              }
          ],
          where: {
              [Sequelize.Op.and]: [
                  Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), { [Sequelize.Op.like]: `%${search}%` }),
                  role ? Sequelize.where(Sequelize.col('Role.role'), { [Sequelize.Op.like]: `%${role}%` }) : {}, // Adjust if needed
                  { emp_id: { [Sequelize.Op.ne]: 'admin' } },  // Exclude users with emp_id 'admin'
                  { '$Role.id$': { [Sequelize.Op.notIn]: [1, 2] } }  // Exclude users with roles 1 or 2
              ],
          },
      });

      res.json({ users, total });
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
  }
};




module.exports={
hrdata,
hrcountemployee,
hractiveemployee,
hrinactiveemployee,
gethremployeeattendance,
getemployee
}