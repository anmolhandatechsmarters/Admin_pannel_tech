const User = require('../models/User');
const Role=require('../models/role') 
const path = require('path');
const multer = require('multer');
const Sequelize = require('sequelize'); 
const db = require('../Connection'); 
const Attendance = require('../models/attendance');
const {Op} =require("sequelize")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });


const uploadImage = async (req, res) => {
    const { id } = req.params;
    const imagePath = req.file?.path;

    if (!id || !imagePath) {
        return res.status(400).json({ message: 'User ID and image file are required' });
    }

    try {
        const [affectedRows] = await db.User.update({ Image: imagePath }, { where: { emp_id:id } });
        if (affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Image updated successfully', imagePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getImage = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await db.User.findOne({ attributes: ['Image'], where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const addUser = async (req, res) => {
    const { email, first_name, last_name, street1, street2, city, state, country, role, status = '0', created_by = 'Admin', password } = req.body;

    if (!email || !first_name || !last_name || !street1 || !city || !state || !country || !password) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }

    try {
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email is already in use.' });

        const maxIdResult = await db.User.max('emp_id', { where: { emp_id: { [Sequelize.Op.like]: 'Emp%' } } });
        const maxId = maxIdResult ? parseInt(maxIdResult.replace('Emp', '')) : 0;
        const newEmpId = `Emp${maxId + 1}`;

        let processedRole;
        if (role === 'Employee') {
            processedRole = '3'; 
        } else if (role === 'HR') {
            processedRole = '2';  
        } else {
            return res.status(400).json({ message: 'Invalid role provided.' });
        }

        const newUser = await db.User.create({
            email,
            emp_id: newEmpId,
            first_name,
            last_name,
            street1,
            street2,
            city,
            state,
            country,
            role: processedRole,  
            status,
            created_by,
            password,
        });

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while creating user', error });
    }
};



const getAllUsers = async (req, res) => {
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
                    attributes: []  // Exclude role columns from Role table in results, only include role_name
                }
            ],
            where: {
                [Sequelize.Op.and]: [
                    Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), { [Sequelize.Op.like]: `%${search}%` }),
                    Sequelize.where(Sequelize.col('Role.role'), { [Sequelize.Op.like]: `%${role}%` }), // Adjust if needed
                    { emp_id: { [Sequelize.Op.ne]: 'admin' } }  // Exclude users with emp_id 'admin'
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
                    Sequelize.where(Sequelize.col('Role.role'), { [Sequelize.Op.like]: `%${role}%` }), // Adjust if needed
                    { emp_id: { [Sequelize.Op.ne]: 'admin' } }  // Exclude users with emp_id 'admin'
                ],
            },
        });

        res.json({ users, total });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};



const getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await db.User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, emp_id, role, country, state, city, street1, street2 } = req.body;

    if (!id || !first_name || !last_name || !email || !emp_id || !role || !country || !state || !city || !street1 || !street2) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Process the role field to convert it to the appropriate ID
    let roleId;
    switch (role) {
        case 'Employee':
            roleId = 3;  // Store '3' for Employee
            break;
        case 'HR':
            roleId = 2;  // Store '1' for HR
            break;
        default:
            return res.status(400).json({ message: 'Invalid role provided.' });
    }

    try {
        const [affectedRows] = await db.User.update(
            { first_name, last_name, email, emp_id, role: roleId, country, state, city, street1, street2 },
            { where: { id } }
        );

        if (affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
};



const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: 'Id is required' });

    try {
        const result = await db.User.destroy({ where: { id } });
        if (result === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while deleting user', error });
    }
};


// =================================================================================


const getAttendance = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const viewuserid = req.query.userid || null;
    const sortColumn = req.query.sort?.column || 'id';
    const sortOrder = req.query.sort?.order || 'asc';
    const month = parseInt(req.query.month) || null;
    const year = parseInt(req.query.year) || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const status = req.query.status || null;
    const offset = (page - 1) * limit;


    const validSortColumns = ['id', 'emp_id', 'fullname', 'in_time', 'out_time', 'date'];
    if (!validSortColumns.includes(sortColumn)) {
        return res.status(400).json({ message: 'Invalid sort column' });
    }

    try {
        const attendanceRecords = await db.Attendance.findAll({
            include: {
                model: db.User,
                attributes: ['first_name', 'last_name', 'emp_id'],
                required: true
            },
            attributes: [
                'id', 'user_id', 'emp_id', 'in_time', 'out_time', 'date', 'comment', 'status',
                [Sequelize.literal(`CONCAT(User.first_name, ' ', User.last_name, '(', Attendance.emp_id, ')')`), 'fullname']
            ],
            where: {
                [Op.and]: [
                    { emp_id: { [Op.ne]: 'Admin' } }, // Exclude records where emp_id is 'Admin'
                    search ? {
                        [Op.or]: [
                            { emp_id: { [Op.like]: `%${search}%` } },
                            { '$User.first_name$': { [Op.like]: `%${search}%` } },
                            { '$User.last_name$': { [Op.like]: `%${search}%` } }
                        ]
                    } : {},
                    month ? Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month) : {},
                    status ? { status } : {},
                    year ? Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year) : {},
                    startDate ? { date: { [Op.gte]: startDate } } : {},
                    endDate ? { date: { [Op.lte]: endDate } } : {},
                    viewuserid ? { emp_id: viewuserid } : {},
                ]
            },
            order: [
                [sortColumn === 'fullname' ? Sequelize.literal(`CONCAT(Attendance.emp_id, '(', User.first_name, ' ', User.last_name, ')')`) : sortColumn, sortOrder]
            ],
            limit,
            offset
        });
       

        const total = await db.Attendance.count({
            include: {
                model: db.User,
                attributes: []
            },
            where: {
                [Op.and]: [
                    { emp_id: { [Op.ne]: 'Admin' } }, // Exclude records where emp_id is 'Admin'
                    search ? {
                        [Op.or]: [
                            { emp_id: { [Op.like]: `%${search}%` } },
                            { '$User.first_name$': { [Op.like]: `%${search}%` } },
                            { '$User.last_name$': { [Op.like]: `%${search}%` } }
                        ]
                    } : {},
                    month ? Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month) : {},
                    status ? { status } : {},
                    year ? Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year) : {},
                    startDate ? { date: { [Op.gte]: startDate } } : {},
                    endDate ? { date: { [Op.lte]: endDate } } : {},
                    viewuserid ? { user_id: viewuserid } : {},
                ]
            }
        });

        res.json({
            success: true,
            attendance: attendanceRecords,
            total
        });
    } catch (error) {
        console.error('Error fetching attendance and user details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const saveComment = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const [updated] = await db.Attendance.update({ comment }, { where: { id } });
    if (updated) {
      res.json({ success: true, message: 'Comment added successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, message: 'Error updating comment' });
  }
};

const deleteAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.Attendance.destroy({ where: { id } });
    if (deleted) {
      res.json({ success: true, message: 'Attendance record deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ success: false, message: 'Error deleting attendance record' });
  }
};

const saveRecord = async (req, res) => {
  const { id } = req.params;
  const { in_time, out_time, date, status, comment } = req.body;

  try {
    const [updated] = await db.Attendance.update(
      { in_time, out_time, date, status, comment },
      { where: { id } }
    );
    if (updated) {
      res.json({ success: true, message: 'Attendance record updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ success: false, message: 'Error updating attendance record' });
  }
};

const viewUser = async (req, res) => {
    const { id } = req.params; 

    try {
        const user = await db.User.findOne({
            where: { emp_id: id },
            include: [
                {
                    model: db.Role,
                    attributes: ['id', 'role'] // Adjust the attribute name to match your Role model
                },
                {
                    model: db.Country,
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                },
                {
                    model: db.State,
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                },
                {
                    model: db.City,
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                }
            ]
        });

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ success: false, message: 'Error retrieving user' });
    }
};

  
  const viewUserAttendance = async (req, res) => {
    const { id } = req.params;
  
    try {
      const attendanceRecords = await db.Attendance.findAll({
        where: { emp_id: id }
      });
      res.json(attendanceRecords);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };








//============================================================================

module.exports = {
    uploadImage,
    getImage,
    addUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    upload,
    getAttendance,
    saveComment,
    deleteAttendance,
    saveRecord,
    viewUser,
    viewUserAttendance
};
