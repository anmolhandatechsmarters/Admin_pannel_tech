const {Sequelize,Op}=require("sequelize")
const db=require("../Connection")


const findemployeedetail = async (req, res) => {
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
  };
  
  const userattendance = async (req, res) => {
    const id = req.params.id;

    try {
        const attendance = await db.Attendance.findOne({
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



const MarkAttendance = async (req, res) => {
    const { id } = req.params; // Extract the user ID from request parameters

    try {
        const intime = new Date();
        const timeString = intime.toLocaleTimeString()
        await db.Attendance.create({
            user_id:id,
            date:intime
            
        })
        // Find the latest attendance record for the user
        const latestRecord = await db.Attendance.findOne({
            where: { user_id: id },
            order: [['date', 'DESC'], ['id', 'DESC']] // Order by date and ID to get the latest record
        });

        if (!latestRecord) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        // Update the latest attendance record's in_time
        const [updatedRows] = await db.Attendance.update(
            { in_time: timeString },
            { where: { id: latestRecord.id } }
        );

        if (updatedRows === 0) {
            return res.status(500).json({ success: false, message: "Failed to update attendance record" });
        }

        // Respond with the updated record
        const updatedRecord = await db.Attendance.findOne({
            where: { id: latestRecord.id }
        });

        return res.json({ success: true, record: updatedRecord });
    } catch (error) {
        console.error("Error updating attendance:", error);
        return res.status(500).json({ success: false, message: "An error occurred while updating attendance" });
    }
};




const UnmarkAttendance = async (req, res) => {
    const { id } = req.params;

    try {
        const outtime = new Date();
        const timeString = outtime.toLocaleTimeString();

        // Find the latest attendance record for the user
        const latestRecord = await db.Attendance.findOne({
            where: { user_id: id },
            order: [['date', 'DESC'], ['id', 'DESC']] // Order by date and ID to get the latest record
        });

        if (!latestRecord) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        // Update the latest attendance record's out_time
        const [updatedRows] = await db.Attendance.update(
            { out_time: timeString },
            { where: { id: latestRecord.id } }
        );

        if (updatedRows === 0) {
            return res.status(500).json({ success: false, message: "Failed to update attendance record" });
        }

        // Fetch the updated record to calculate the duration
        const updatedRecord = await db.Attendance.findOne({
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
        await db.Attendance.update(
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








module.exports={
    findemployeedetail,
    userattendance,
    MarkAttendance,
    UnmarkAttendance
}