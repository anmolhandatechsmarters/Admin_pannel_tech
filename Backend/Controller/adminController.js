const path = require('path');
const multer = require('multer');
const Sequelize = require('sequelize');
const db = require('../Connection');
const { Op } = require("sequelize");
const { Parser } = require('json2csv');

//make a multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });


const uploadImage = async (req, res) => {
    const { id } = req.params;
    const logid = req.query.logid
    const logip = req.query.logip
    const imagePath = req.file?.path;
    const currentDate = new Date();
    if (!id || !imagePath) {
        return res.status(400).json({ message: 'User ID and image file are required' });
    }

    try {
        const [affectedRows] = await db.users.update({ image: imagePath }, { where: { id } });
        if (affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Image updated successfully', imagePath });

        const currentDate = new Date();
        await db.logs.create({
            user_id: logid, 
            api: "localhost:3000/uploadimage",
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ message: 'Internal server error' });
        await db.logs.create({
            user_id: logid,  
            api: "localhost:3000/uploadimage",
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });
    }
};



const getImage = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await db.users.findOne({ attributes: ['image'], where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const addUser = async (req, res) => {
    const logip = req.query.logip
    const {
        email,
        first_name,
        last_name,
        street1,
        street2,
        city,
        state,
        country,
        role,
        status = '0',
        created_by = 'Admin',
        password,
        department,
        designation,
        id
    } = req.body;

 
    if (!email || !first_name || !last_name || !street1 || !city || !state || !country || !password || !department || !designation) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }


    try {
      
        const existingUser = await db.users.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email is already in use.' });

        const generateUniqueEmpId = async () => {
            let newEmpIdNumber = 1;
            while (true) {
                const newEmpId = `Emp${newEmpIdNumber}`;
                const existingEmp = await db.users.findOne({ where: { emp_id: newEmpId } });
                if (!existingEmp) return newEmpId;
                newEmpIdNumber++;
            }
        };

        const newEmpId = await generateUniqueEmpId();

  
        const roleMapping = {
            'Employee': '3',
            'HR': '2',
        };
        const processedRole = roleMapping[role];
        if (!processedRole) return res.status(400).json({ message: 'Invalid role provided.' });

        const newUser = await db.users.create({
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
            department_id: department,
            designation_id: designation,
        });

        res.status(201).json({ message: 'User created successfully', user: newUser });
        const currentDate = new Date();
        await db.logs.create({
            user_id: id, 
            api: "localhost:3000/adduser",
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error occurred while creating user', error: error.message });
        await db.logs.create({
            user_id: id, 
            api: "localhost:3000/adduser",
            message: "failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });


    }
};




const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
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
      
        const users = await db.users.findAll({
            attributes: [
                'id', 'email', 'emp_id', 'first_name', 'last_name', 'country', 'state', 'city', 'street1', 'street2', 'last_login', 'status',
                [Sequelize.col('roleDetails.role'), 'role']  
            ],
            include: [
                {
                    model: db.roles,
                    as: 'roleDetails',
                    attributes: ['role'],
                },
                {
                    model: db.cities,
                    as: 'cityDetails',
                    attributes: ['name'],
                },
                {
                    model: db.states,
                    as: 'stateDetails',
                    attributes: ['name'],
                },
                {
                    model: db.countries,
                    as: 'countryDetails',
                    attributes: ['name'],
                }
            ],
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), { [Op.like]: `%${search}%` }),
                            { email: { [Op.like]: `%${search}%` } },
                            { emp_id: { [Op.like]: `%${search}%` } }
                        ]
                    },
                    role ? Sequelize.where(Sequelize.col('roleDetails.role'), { [Op.like]: `%${role}%` }) : {},
                    { emp_id: { [Op.ne]: 'admin' } },
                    { '$roleDetails.id$': { [Op.notIn]: [1] } }
                ],
            },
            order: [[sortColumn, sortOrder]],
            limit,
            offset,
        });


        const total = await db.users.count({
            include: [
                {
                    model: db.roles,
                    as: 'roleDetails',
                    attributes: []
                }
            ],
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), { [Op.like]: `%${search}%` }),
                            { email: { [Op.like]: `%${search}%` } },
                            { emp_id: { [Op.like]: `%${search}%` } }
                        ]
                    },
                    role ? Sequelize.where(Sequelize.col('roleDetails.role'), { [Op.like]: `%${role}%` }) : {},
                    { emp_id: { [Op.ne]: 'admin' } },  // Exclude users with emp_id 'admin'
                    { '$roleDetails.id$': { [Op.notIn]: [1, 2] } }  // Exclude users with roles 1 or 2
                ],
            },
        });

        res.json({ users, total });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};





// -----------------------------------------------------------------------------------


const getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await db.users.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const logid = req.query.logid
    const logip = req.query.logip
    const {
        first_name,
        last_name,
        email,
        emp_id,
        role,
        country,
        state,
        city,
        street1,
        street2,
        department,
        designation,


    } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    // Create an object to hold the fields that need to be updated
    const updateFields = {};

    if (first_name) updateFields.first_name = first_name;
    if (last_name) updateFields.last_name = last_name;
    if (email) updateFields.email = email;
    if (emp_id) updateFields.emp_id = emp_id;

    if (role) {
        // Process the role field to convert it to the appropriate ID
        switch (role) {
            case 'Employee':
                updateFields.role = 3;  // Store '3' for Employee
                break;
            case 'HR':
                updateFields.role = 2;  // Store '2' for HR
                break;
            default:
                return res.status(400).json({ message: 'Invalid role provided.' });
        }
    }
    if (country) updateFields.country = country;
    if (state) updateFields.state = state;
    if (city) updateFields.city = city;
    if (street1) updateFields.street1 = street1;
    if (street2) updateFields.street2 = street2;
    if (department) updateFields.department = department; // Fixed casing to match DB schema
    if (designation) updateFields.designation = designation; // Fixed casing and spelling

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No fields to update.' });
    }

    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // Date in YYYY-MM-DD format
    const timeString = currentDate.toLocaleTimeString(); // Time in HH:MM:SS format

    try {
        const [affectedRows] = await db.users.update(updateFields, { where: { id } });

        if (affectedRows === 0) return res.status(404).json({ message: 'User not found' });

        // Log the update
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/addupdate/${id}`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });

        res.status(200).json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/addupdate/${id}`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });
    }
};





const deleteUser = async (req, res) => {
    const { id } = req.params;
    const logid = req.query.logid; // Updated to get logid from query parameters
    const logip = req.query.logip
    if (!id) return res.status(400).json({ message: 'Id is required' });
    if (!logid) return res.status(400).json({ message: 'Log ID is required' }); // Ensure logid is provided

    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // Date in YYYY-MM-DD format
    const timeString = currentDate.toLocaleTimeString(); // Time in HH:MM:SS format

    try {
        // Attempt to delete the user
        const result = await db.users.destroy({ where: { id } });

        if (result === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the deletion
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/deleteuser/${id}`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });

        // Respond after logging
        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error occurred while deleting user:', error);
        res.status(500).json({ message: 'Error occurred while deleting user', error });
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/deleteuser/${id}`,
            message: "failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });
    }
};


// =================================================================================
const getAttendance = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const empIdParam = req.query.empid; // empId parameter
    const sortColumn = req.query.sort?.column || 'id';
    const sortOrder = req.query.sort?.order || 'asc';
    const month = parseInt(req.query.month, 10) || null;
    const year = parseInt(req.query.year, 10) || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const status = req.query.status || null;
    const offset = (page - 1) * limit;

    // Validate sort column and sort order
    const validSortColumns = ['id', 'in_time', 'out_time', 'date'];
    if (!validSortColumns.includes(sortColumn)) {
        return res.status(400).json({ message: 'Invalid sort column' });
    }
    if (!['asc', 'desc'].includes(sortOrder)) {
        return res.status(400).json({ message: 'Invalid sort order' });
    }

    try {
        let userIds = [];

        // Fetch user IDs based on empId
        if (empIdParam) {
            const users = await db.users.findAll({
                attributes: ['id'],
                where: { emp_id: empIdParam }
            });

            userIds = users.map(user => user.id);
        }

        const attendanceRecords = await db.attendances.findAll({
            include: [
                {
                    model: db.users,
                    as: 'userDetails',
                    attributes: ['first_name', 'last_name', 'emp_id', 'role'],
                    required: true
                }
            ],
            attributes: [
                'id', 'user_id', 'in_time', 'out_time', 'date', 'comment', 'status',
                [Sequelize.literal(`CONCAT(userDetails.first_name, ' ', userDetails.last_name, '(', userDetails.emp_id, ')')`), 'fullname']
            ],
            where: {
                [Op.and]: [
                    userIds.length > 0 ? { user_id: userIds } : {},
                    { user_id: { [Op.ne]: 1 } }, // Exclude user_id 1
                    search ? {
                        [Op.or]: [
                            { '$userDetails.first_name$': { [Op.like]: `%${search}%` } },
                            { '$userDetails.last_name$': { [Op.like]: `%${search}%` } },
                            { '$userDetails.emp_id$': { [Op.like]: `%${search}%` } }
                        ]
                    } : {},
                    month ? Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month) : {},
                    year ? Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year) : {},
                    startDate ? { date: { [Op.gte]: startDate } } : {},
                    endDate ? { date: { [Op.lte]: endDate } } : {},
                    status ? { status } : {}
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
            const userRole = record.userDetails.role;
            const recordUserId = record.user_id;

            // Exclude records where role is "Admin" and user_id is 1
            return !(userRole === 'Admin' && recordUserId === "1");
        });

        // Count total records for pagination
        const total = await db.attendances.count({
            include: [
                {
                    model: db.users,
                    as: 'userDetails',
                    attributes: []
                }
            ],
            where: {
                [Op.and]: [
                    userIds.length > 0 ? { user_id: userIds } : {},
                    { user_id: { [Op.ne]: 1 } }, // Exclude user_id 1
                    search ? {
                        [Op.or]: [
                            { '$userDetails.first_name$': { [Op.like]: `%${search}%` } },
                            { '$userDetails.last_name$': { [Op.like]: `%${search}%` } },
                            { '$userDetails.emp_id$': { [Op.like]: `%${search}%` } }
                        ]
                    } : {},
                    month ? Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month) : {},
                    year ? Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year) : {},
                    startDate ? { date: { [Op.gte]: startDate } } : {},
                    endDate ? { date: { [Op.lte]: endDate } } : {},
                    status ? { status } : {}
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


const saveComment = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const logid = req.query.logid
    const logip = req.query.logip
    try {
        const [updated] = await db.attendances.update({ comment }, { where: { id } });
        if (updated) {
            res.json({ success: true, message: 'Comment added successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Attendance record not found' });
        }
        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/addcomment/${id}`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ success: false, message: 'Error updating comment' });
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/addcomment/${id}`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });

    }
};

const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    const logid = req.query.logid
    const logip = req.query.logip
    try {
        const deleted = await db.attendances.destroy({ where: { id } });
        if (deleted) {
            res.json({ success: true, message: 'Attendance record deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Attendance record not found' });
        }
        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/deleteattendance/${id}`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });

    } catch (error) {
        console.error('Error deleting attendance record:', error);
        res.status(500).json({ success: false, message: 'Error deleting attendance record' });
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/deleteattendance/${id}`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });
    }
};

const saveRecord = async (req, res) => {
    const { id } = req.params;
    const { in_time, out_time, date, status, comment } = req.body;
    const logid = req.query.logid
    const logip = req.query.logip
    try {
        const [updated] = await db.attendances.update(
            { in_time, out_time, date, status, comment },
            { where: { id } }
        );
        if (updated) {
            res.json({ success: true, message: 'Attendance record updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Attendance record not found' });
        }


        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/editattendance/${id}`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });



    } catch (error) {
        console.error('Error updating attendance record:', error);
        res.status(500).json({ success: false, message: 'Error updating attendance record' });
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/editattendance/${id}`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });
    }
};

const viewUser = async (req, res) => {
    const { id } = req.params; // This should be the user_id

    try {
        // Fetch the user based on user_id
        const user = await db.users.findOne({
            where: { id }, // Use user_id here
            include: [
                {
                    model: db.roles,
                    as: 'roleDetails',  // Make sure this alias matches your association
                    attributes: ['id', 'role'] // Adjust the attribute name to match your Role model
                },
                {
                    model: db.countries,
                    as: 'countryDetails',  // Make sure this alias matches your association
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                },
                {
                    model: db.states,
                    as: 'stateDetails',  // Make sure this alias matches your association
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                },
                {
                    model: db.cities,
                    as: 'cityDetails',  // Make sure this alias matches your association
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                },
                {
                    model: db.attendances,
                    as: 'attendances',  // Make sure this alias matches your association
                    attributes: ['id', 'user_id', 'in_time', 'out_time', 'date', 'status'] // Adjust attribute names if necessary
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
        const attendanceRecords = await db.attendances.findAll({
            where: { user_id: id }
        });
        res.json(attendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

//===============================================================

const logs = async (req, res) => {

    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await db.logs.findAndCountAll({
            where: {
                [Op.or]: [
                    { user_id: { [Op.like]: `%${search}%` } },
                    { api: { [Op.like]: `%${search}%` } }
                ]
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'DESC']] // Optionally add sorting
        });

        res.json({
            logs: rows,
            total: count // Include the total count in the response
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'An error occurred while fetching logs' });
    }

}


const deletelog = async (req, res) => {
    const id = req.params.id
    try {
        const result = await db.logs.destroy({
            where: { id: id }
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
}



//===================================================================

const adddepartment = async (req, res) => {
    const departmentname = req.body.name;
    const logid = req.body.logid
    const logip = req.body.logip
    try {
        // Check if the department already exists
        const existingDepartment = await db.departments.findOne({ where: { department_name: departmentname } });

        if (existingDepartment) {
            // If it exists, send a 409 Conflict status
            return res.status(409).json({ message: 'Department already exists' });
        }

        // Create a new department if it does not exist
        const result = await db.departments.create({
            department_name: departmentname
        });


        res.status(201).json(result);
        const currentDate = new Date();
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/adddepartment`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send success response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/adddepartment`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send su // Handle server errors
    }
};


const getdepartmentdetail = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await db.departments.findAndCountAll({
            where: {
                department_name: {
                    [Op.like]: `%${search}%` // Use Op.like for search functionality
                }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            total: count,
            departments: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching department details:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


//departmant edit

const editdepartment = async (req, res) => {
    const { id } = req.params;
    const department_name = req.body.name;
    const logid = req.body.logid;
    const logip = req.body.logip

    try {
        // Check if the new department name already exists
        const existingDepartment = await db.departments.findOne({
            where: {
                department_name: department_name,
                id: { [db.Sequelize.Op.ne]: id } // Exclude the current department being updated
            }
        });

        if (existingDepartment) {
            return res.status(400).json({ success: false, message: 'Department name already exists' });
        }

        // Update the department name
        const [updated] = await db.departments.update({ department_name }, { where: { id } });

        if (updated) {
            // Log the update action
            const currentDate = new Date();
            const dateString = currentDate.toISOString();
            const timeString = currentDate.toLocaleTimeString();

            await db.logs.create({
                user_id: logid,  // Ensure req.user.id is correctly set
                api: `localhost:3000/editdepartment/${id}`,
                message: "Success",

                ip: logip,
                date: currentDate.toISOString().split('T')[0],
                time: currentDate.toTimeString().split(' ')[0],
            }); // Send su

            return res.json({ success: true, message: 'Department updated successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

    } catch (error) {
        console.error('Error updating department:', error);
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/editdepartment/${id}`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send su
        return res.status(500).json({ success: false, message: 'Error updating department' });

    }
};


const deletedepartment = async (req, res) => {
    const id = req.params.id;
    const logid = req.query.logid
    const logip = req.query.logip
    try {
        // Attempt to delete the department
        const result = await db.departments.destroy({
            where: { id: id }
        });
        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/deletedepartment/${id}`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });

        // Check if any rows were affected (i.e., the deletion was successful)
        if (result === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.status(200).json({ message: 'Department deleted successfully' });
        // Send sua

    } catch (error) {
        console.error("Error deleting department:", error);

        // Check for foreign key constraint violation
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'This department cannot be deleted because it is associated with other records.' });
        }
        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/deletedepartment/${id}`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send su

        res.status(500).json({ message: 'Server error' });
    }
};


//designation

const adddesignation = async (req, res) => {
    const designationName = req.body.name;
    const logid = req.body.logid
    const logip = req.body.logip
    try {
        // Check if the designation already exists
        const existingDesignation = await db.designations.findOne({ where: { designation_name: designationName } });

        if (existingDesignation) {
            return res.status(409).json({ message: 'Designation already exists' });
        }

        // Create a new designation if it does not exist
        const result = await db.designations.create({
            designation_name: designationName
        });

        res.status(201).json(result); // Send success response
        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/adddesignation`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send su




    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/adddesignation`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send su // Handle server errors
    }
};



const getdesignation = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Validate and sanitize input
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), 100); // Limit max to 100
    const offset = (parsedPage - 1) * parsedLimit;

    try {
        const { count, rows } = await db.designations.findAndCountAll({
            where: {
                designation_name: {
                    [Op.like]: `%${search.replace(/[%_]/g, '\\$&')}%` // Escape special characters
                }
            },
            limit: parsedLimit,
            offset: offset,
        });

        res.json({
            total: count,
            designations: rows, // Changed "departments" to "designations" for clarity
            totalPages: Math.ceil(count / parsedLimit),
            currentPage: parsedPage,
        });
    } catch (error) {
        console.error('Error fetching designation details:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const editdesignation = async (req, res) => {
    const { id } = req.params;
    const designation_name = req.body.name;
    const logid = req.body.logid;
    const logip = req.body.logip

    try {
        // Check if the new department name already exists
        const existingDepartment = await db.designations.findOne({
            where: {
                designation_name: designation_name,
                id: { [db.Sequelize.Op.ne]: id } // Exclude the current department being updated
            }
        });

        if (existingDepartment) {
            return res.status(400).json({ success: false, message: 'Department name already exists' });
        }

        // Update the department name
        const [updated] = await db.designations.update({ designation_name }, { where: { id } });

        if (updated) {
            // Log the update action
            const currentDate = new Date();
            const dateString = currentDate.toISOString();
            const timeString = currentDate.toLocaleTimeString();

            await db.logs.create({
                user_id: logid,  // Ensure req.user.id is correctly set
                api: `localhost:3000/editdesignation/${id}`,
                message: "Success",

                ip: logip,
                date: currentDate.toISOString().split('T')[0],
                time: currentDate.toTimeString().split(' ')[0],
            }); // Send su

            return res.json({ success: true, message: 'Department updated successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

    } catch (error) {
        console.error('Error updating department:', error);
        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/editdesignation/${id}`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send su
        return res.status(500).json({ success: false, message: 'Error updating department' });


    }
};





const deletedesignation = async (req, res) => {
    const id = req.params.id;
    const logid = req.query.logid
    const logip = req.query.logip
    try {
        // Attempt to delete the designation
        const result = await db.designations.destroy({
            where: { id: id }
        });

        // Check if any rows were affected (i.e., the deletion was successful)
        if (result === 0) {
            return res.status(404).json({ message: 'Designation not found' });
        }

        res.status(200).json({ message: 'Designation deleted successfully' });
        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/deletedesignation/${id}`,
            message: "Success",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send su
    } catch (error) {
        console.error("Error deleting designation:", error);

        // Check for foreign key constraint violation
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'This designation cannot be deleted because it is associated with other records.' });
        }

        res.status(500).json({ message: 'Server error' });

        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        const timeString = currentDate.toLocaleTimeString();

        await db.logs.create({
            user_id: logid,  // Ensure req.user.id is correctly set
            api: `localhost:3000/deletedesignation/${id}`,
            message: "Failed",

            ip: logip,
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        }); // Send su
    }
};


const getadmindepartment = async (req, res) => {
    try {
        const result = await db.departments.findAll()
        res.json(result)
    } catch (error) {
        res.json(error)
    }
}

const getadmindesignation = async (req, res) => {
    try {
        const result = await db.designations.findAll()
        res.json(result)
    } catch (error) {
        res.json(error)
    }
}


//============================================================================
//Attendance


const allattendancedownload = async (req, res) => {
    try {

        const results = await db.attendances.findAll({
            include: [{
                model: db.users,
                as: 'userDetails',
                attributes: ['first_name', 'last_name', 'emp_id', 'email', 'role'], // Include role for filtering
                required: true // Ensures only records with user details are fetched
            }],
            where: {
                '$userDetails.role$': { [Op.notIn]: [1, 'Admin'] } // Exclude users with role 1 or 'Admin'
            }
        });

        // Transform the results to include full name and other fields
        const transformedResults = results.map(item => {
            const attendance = item.get({ plain: true });
            const user = attendance.userDetails;
            const role=attendance.roleDetails;
            return {
                fullname: `${user.first_name} ${user.last_name}`,
                email: user.email,
                emp_id: user.emp_id,
                in_time: attendance.in_time,
                out_time: attendance.out_time,
                date: attendance.date,
                status: attendance.status,  
            };
        });

        // Convert results to CSV
        const csv = new Parser().parse(transformedResults);

        // Set headers for download
        res.header('Content-Type', 'text/csv');
        res.attachment('Attendance.csv');
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error querying the database');
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
    viewUserAttendance,
    logs,
    deletelog,
    adddepartment,
    getdepartmentdetail,
    editdepartment,
    deletedepartment,
    adddesignation,
    getdesignation,
    editdesignation,
    deletedesignation,
    getadmindepartment,
    getadmindesignation,
    allattendancedownload

};
