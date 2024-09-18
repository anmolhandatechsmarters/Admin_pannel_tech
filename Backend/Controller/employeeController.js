const {Sequelize,Op}=require("sequelize")
const db=require("../Connection")


const findemployeedetail = async (req, res) => {
    const id = req.params.id;
  
    try {
      const user = await db.users.findOne({
        where: { id: id },
        include: [
           {
                    model: db.roles,
                    as: 'roleDetails',  // Use the alias defined in your association
                    attributes: ['id', 'role'] 
                },
                {
                    model: db.attendances,
                    as: 'attendances',  // Use the alias defined in your association
                    attributes: ['in_time', 'out_time', 'date']
                },
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
  };
  
  const userattendance = async (req, res) => {
    const id = req.params.id;

    try {
        const attendance = await db.attendances.findOne({
            where: { user_id: id },
            order: [['date', 'DESC'], ['id', 'DESC']], // Order by date and ID to get the latest record
        });

        if (attendance) {
            res.json(attendance);
        } else {
            res.status(404).json({ message: 'Attendance record not found' });
        }
    } catch (error) {
        console.error("Error fetching attendance:", error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred while fetching attendance' });
    }
};





const MarkAttendance=async(req,res)=>{
    const id=req.params.id

try{
    const intime = new Date();
    const timeString = intime.toLocaleTimeString()
    const today = new Date().toISOString().split('T')[0];


const user=await db.attendances.create({
    user_id:id,
    date: today,
    in_time:timeString,
})

res.json(user)
const latestRecord = await db.attendances.findOne({
    where: { user_id: id },
    order: [['date', 'DESC'], ['id', 'DESC']] // Order by date and ID to get the latest record
});

if (!latestRecord) {
    return res.status(404).json({ success: false, message: "Attendance record not found" });
}

// Update the latest attendance record's in_time
const [updatedRows] = await db.attendances.update(
    { in_time: timeString },
    { where: { id: latestRecord.id } }
);

if (updatedRows === 0) {
    return res.status(500).json({ success: false, message: "Failed to update attendance record" });
}

// Respond with the updated record
const updatedRecord = await db.attendances.findOne({
    where: { id: latestRecord.id }
});

return res.json({ success: true, record: updatedRecord });
}catch(error){

}

}

const UnmarkAttendance = async (req, res) => {
    const { id } = req.params;

    try {
        const outtime = new Date();
        const timeString = outtime.toLocaleTimeString();

        // Find the latest attendance record for the user
        const latestRecord = await db.attendances.findOne({
            where: { user_id: id },
            order: [['date', 'DESC'], ['id', 'DESC']]
        });

        if (!latestRecord) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        // Update the latest attendance record's out_time
        const [updatedRows] = await db.attendances.update(
            { out_time: timeString },
            { where: { id: latestRecord.id } }
        );

        if (updatedRows === 0) {
            return res.status(500).json({ success: false, message: "Failed to update attendance record" });
        }

        // Fetch the updated record to calculate the duration
        const updatedRecord = await db.attendances.findOne({
            where: { id: latestRecord.id }
        });

        const inTime = new Date(`${updatedRecord.date}T${updatedRecord.in_time}`);
        const outTime = new Date(`${updatedRecord.date}T${timeString}`);

        // Calculate the difference in milliseconds
        const diffMs = outTime - inTime;
        const diffHours = diffMs / (1000 * 60 * 60);

        // Determine status based on the duration
        let status = '';
        if (diffHours > 6) {
            status = 'Present';
        } else if (diffHours <= 6 && diffHours >= 4) {
            status = 'Halfday';
        } else {
            status = 'Absent';
        }

        // Update the status field
        await db.attendances.update(
            { status },
            { where: { id: latestRecord.id } }
        );

        // Respond with the updated record
        return res.json({ success: true, record: updatedRecord });
    } catch (error) {
        console.error("Error updating attendance:", error);
        return res.status(500).json({ success: false, message: "An error occurred while updating attendance" });
    }
};

const Getattendance = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const month = parseInt(req.query.month, 10) || null;
    const year = parseInt(req.query.year, 10) || null;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const status = req.query.status || null;
    const offset = (page - 1) * limit;



    try {
        const where = { user_id: id };

        // Initialize conditions array
        const conditions = [];

        if (month) {
            conditions.push(month ? Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month) : {},);
        }
        if (year) {
            conditions.push(year ? Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year) : {},);
        }
        if (startDate) {
            conditions.push(startDate ? { date: { [Op.gte]: startDate } } : {},
            );
        }
        if (endDate) {
            conditions.push({ date: { [Op.lte]: endDate } });
        }
        if (status) {
            conditions.push({ status });
        }

        if (conditions.length > 0) {
            where[Op.and] = conditions;
        }

        // Query for attendance data
        const user = await db.attendances.findAndCountAll({
            where,
            offset,
            limit,
            order: [['date', 'DESC']] // Order by date or any other relevant field
        });
        const count=await db.attendances.count({
            where:{user_id:id}
        })
        res.json({
            totalCount: user.count,
            data: user.rows,
            count:count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
;





module.exports={
    findemployeedetail,
    userattendance,
    MarkAttendance,
    UnmarkAttendance,
    Getattendance,

}