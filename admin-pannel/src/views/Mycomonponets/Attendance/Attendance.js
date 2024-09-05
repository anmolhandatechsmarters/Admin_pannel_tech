import React, { useEffect, useState } from 'react';
import "../CSS/Attendancetable.css";
import axios from "axios";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [comments, setComments] = useState({});

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const response = await axios.get("http://localhost:7000/admin/getattendance", {
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.data.success) {
          setAttendanceData(response.data.attendance);
        } else {
          setError('Failed to fetch data.');
        }
      } catch (error) {
        setError('An error occurred while fetching data.');
        console.error("Error fetching attendance data:", error);
      }
    }

    fetchAttendance();
  }, []);

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString([], options);
  }

  const handleEditButtonClick = (id) => {
    setEditCommentId(id);
    setComments(prevComments => ({
      ...prevComments,
      [id]: prevComments[id] || ''
    }));
  };

  const handleCommentChange = (id, event) => {
    setComments(prevComments => ({
      ...prevComments,
      [id]: event.target.value
    }));
  };

  const handleSaveComment = async (id) => {
    try {
      await axios.post("http://localhost:7000/admin/savecomment", {
        id,
        comment: comments[id]
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      setEditCommentId(null); // Close the comment input
    } catch (error) {
      setError('An error occurred while saving the comment.');
      console.error("Error saving comment:", error);
    }
  };

  const handleCancelComment = () => {
    setEditCommentId(null); // Close the comment input
  };

  return (
    <div className='attendance-table'>
      <div className='attendance-table-container'>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th>Date</th>
              <th>Status</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record) => (
              <tr key={record.id}>
                <td>{record.user_id}</td>
                <td>{record.fullname}</td>
                <td>{record.in_time}</td>
                <td>{record.out_time}</td>
                <td>{formatDate(record.date)}</td>
                <td>{record.status}</td>
                <td>
                  {editCommentId === record.id ? (
                    <div>
                      <input
                        type="text"
                        value={comments[record.id] || ''}
                        onChange={(e) => handleCommentChange(record.id, e)}
                      />
                      <button onClick={() => handleSaveComment(record.id)}>Save</button>
                      <button onClick={handleCancelComment}>Cancel</button>
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => handleEditButtonClick(record.id)}>Add Comment</button>
                      {record.comment && <span>{record.comment}</span>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Attendance;
