const path = require('path');
const multer = require('multer');
const Sequelize = require('sequelize');
const db = require('../Connection');
const { Op } = require("sequelize");
const { isAsyncFunction } = require('util/types');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

// Upload image for a user
const uploadImage = async (req, res) => {
    const { id } = req.params;
    const imagePath = req.file?.path;

    if (!id || !imagePath) {
        return res.status(400).json({ message: 'User ID and image file are required' });
    }

    try {
        const [affectedRows] = await db.users.update({ image: imagePath }, { where: { id } });
        if (affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Image updated successfully', imagePath });
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user image
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

// Add a new user
const addUser = async (req, res) => {
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

    // Check for required fields
    if (!email || !first_name || !last_name || !street1 || !city || !state || !country || !password || !department || !designation) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }

    try {
        // Check if the email already exists
        const existingUser = await db.users.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email is already in use.' });

        // Generate a unique employee ID
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

        // Process the role
        const roleMapping = {
            'Employee': '3',
            'HR': '2',
        };
        const processedRole = roleMapping[role];
        if (!processedRole) return res.status(400).json({ message: 'Invalid role provided.' });

        // Log the action
        const currentDate = new Date();
        await db.logs.create({
            user_id: id,  // Ensure req.user.id is correctly set
            api: "localhost:3000/adduser",
            date: currentDate.toISOString().split('T')[0],
            time: currentDate.toTimeString().split(' ')[0],
        });

        // Create the new user
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
            department_id:department,
            designation_id:designation,
        });

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error occurred while creating user', error: error.message });
    }
};

// Get all users with pagination, search, and sorting


const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const sortColumn = req.query.sort?.column || 'id';
    const sortOrder = req.query.sort?.order || 'asc';

    const offset = (page - 1) * limit;

    // Validate sort column
    const validSortColumns = ['id', 'first_name', 'last_name', 'email', 'emp_id', 'role', 'country', 'state', 'city', 'last_login', 'status'];
    if (!validSortColumns.includes(sortColumn)) {
        return res.status(400).json({ message: 'Invalid sort column' });
    }

    try {
        // Fetch users with pagination, sorting, and filtering
        const users = await db.users.findAll({
            attributes: [
                'id', 'email', 'emp_id', 'first_name', 'last_name', 'country', 'state', 'city', 'street1', 'street2', 'last_login', 'status',
                [Sequelize.col('roleDetails.role'), 'role']  // Include role name from Role table
            ],
            include: [
                {
                    model: db.roles,
                    as: 'roleDetails',  // Alias for the role association
                    attributes: ['role'],  // Include role column for display
                },
                {
                    model: db.cities,
                    as: 'cityDetails',
                    attributes: ['name'],  // Assuming 'name' is a column in 'cities'
                },
                {
                    model: db.states,
                    as: 'stateDetails',
                    attributes: ['name'],  // Assuming 'name' is a column in 'states'
                },
                {
                    model: db.countries,
                    as: 'countryDetails',
                    attributes: ['name'],  // Assuming 'name' is a column in 'countries'
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), { [Op.like]: `%${search}%` }),
                    role ? Sequelize.where(Sequelize.col('roleDetails.role'), { [Op.like]: `%${role}%` }) : {}, // Filter by role if provided
                    { emp_id: { [Op.ne]: 'admin' } },  // Exclude users with emp_id 'admin'
                    { '$roleDetails.id$': { [Op.notIn]: [1] } }  // Exclude users with roles 1 or 2
                ],
            },
            order: [[sortColumn, sortOrder]],
            limit,
            offset,
        });

        // Count total users matching the criteria
        const total = await db.users.count({
            include: [
                {
                    model: db.roles,
                    as: 'roleDetails',
                    attributes: []  // Exclude role columns from Role table in count query
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), { [Op.like]: `%${search}%` }),
                    role ? Sequelize.where(Sequelize.col('roleDetails.role'), { [Op.like]: `%${role}%` }) : {}, // Filter by role if provided
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
            user_id: logid,
            api: `http://localhost:7000/admin/updateUser/${id}`,
            date: dateString,
            time: timeString
        });

        res.status(200).json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
};





const deleteUser = async (req, res) => {
    const { id } = req.params;
    const logid = req.query.logid; // Updated to get logid from query parameters

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
            user_id: logid,
            api: `http://localhost:7000/admin/deleteuser/${id}`, // Ensure this URL is correct
            date: dateString,
            time: timeString
        });

        // Respond after logging
        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error occurred while deleting user:', error);
        res.status(500).json({ message: 'Error occurred while deleting user', error });
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
                    as: 'userDetails',  // Use the alias defined in your association
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
                    userIds.length > 0 ? { user_id: userIds } : {},  // Filter by user_id from userIds
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
            return !(userRole === 'Admin' && recordUserId === 1);
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
                    userIds.length > 0 ? { user_id: userIds } : {},  // Filter by user_id from userIds
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
            user_id: logid,
            api: `localhost:3000/addcomment/${id}`,
            date: dateString,
            time: timeString
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ success: false, message: 'Error updating comment' });
    }
};

const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    const logid = req.query.logid
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
            user_id: logid,
            api: `localhost:3000/deleteattendance/${id}`,
            date: dateString,
            time: timeString
        });
    } catch (error) {
        console.error('Error deleting attendance record:', error);
        res.status(500).json({ success: false, message: 'Error deleting attendance record' });
    }
};

const saveRecord = async (req, res) => {
    const { id } = req.params;
    const { in_time, out_time, date, status, comment } = req.body;
    const logid = req.query.logid
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
            user_id: logid,
            api: `localhost:3000/addcomment/${id}`,
            date: dateString,
            time: timeString
        });



    } catch (error) {
        console.error('Error updating attendance record:', error);
        res.status(500).json({ success: false, message: 'Error updating attendance record' });
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
                    as: 'roleDetails',  // Use the alias defined in your association
                    attributes: ['id', 'role'] // Adjust the attribute name to match your Role model
                },
                {
                    model: db.countries,
                    as: 'countryDetails',  // Use the alias defined in your association
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                },
                {
                    model: db.states,
                    as: 'stateDetails',  // Use the alias defined in your association
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                },
                {
                    model: db.cities,
                    as: 'cityDetails',  // Use the alias defined in your association
                    attributes: ['id', 'name'] // Adjust attribute names if necessary
                },
                {
                    model: db.attendances,
                    as: 'attendances',  // Use the alias defined in your association
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
            order: [['date', 'DESC']] // Optionally add sorting
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
    const departmentname = req.body.name
    try {
        const result = await db.departments.create({
            department_name: departmentname

        })
        res.json(result)
    } catch (error) {
        console.log(error)
    }

}

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

    try {
        // Update the department name
        const [updated] = await db.departments.update({ department_name }, { where: { id } });

        if (updated) {
            // Log the update action
            const currentDate = new Date();
            const dateString = currentDate.toISOString();
            const timeString = currentDate.toLocaleTimeString();

            await db.logs.create({
                user_id: logid,
                api: `localhost:3000/editdepartment/${id}`, // Updated to match the action
                date: dateString,
                time: timeString
            });

            res.json({ success: true, message: 'Department updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Department not found' });
        }

    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ success: false, message: 'Error updating department' });
    }
};

const deletedepartment = async (req, res) => {
    const id = req.params.id
    try {
        const result = await db.departments.destroy({
            where: { id: id }
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
}

//designation

const adddesignation = async (req, res) => {
    const departmentname = req.body.name
    try {
        const result = await db.designations.create({
            designation_name: departmentname

        })
        res.json(result)
    } catch (error) {
        console.log(error)
    }

}


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
    const designation = req.body.name;
    const logid = req.body.logid;

    try {
        // Update the department name
        const [updated] = await db.designations.update({ designation }, { where: { id } });

        if (updated) {
            // Log the update action
            const currentDate = new Date();
            const dateString = currentDate.toISOString();
            const timeString = currentDate.toLocaleTimeString();

            await db.logs.create({
                user_id: logid,
                api: `localhost:3000/editdesignation/${id}`, // Updated to match the action
                date: dateString,
                time: timeString
            });

            res.json({ success: true, message: 'Department updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Department not found' });
        }

    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ success: false, message: 'Error updating department' });
    }
};


const deletedesignation = async (req, res) => {
    const id = req.params.id
    try {
        const result = await db.designations.destroy({
            where: { id: id }
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
}

const getadmindepartment=async(req,res)=>{
    try{
        const result=await db.departments.findAll()
        res.json(result)
    }catch(error){
        res.json(error)
    }
}

const getadmindesignation =async(req,res)=>{
    try{
        const result=await db.designations.findAll()
        res.json(result)
    }catch(error){
        res.json(error)
    }
}



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
    getadmindesignation

};
