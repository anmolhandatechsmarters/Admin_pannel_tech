import React, { useEffect, useState } from 'react';
import "../CSS/Attendancetable.css";
import axios from "axios";
import { MdDelete, MdEdit, MdOutlineDone, MdCancel } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { FcAlphabeticalSortingAz ,FcAlphabeticalSortingZa } from "react-icons/fc";
const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editRecordId, setEditRecordId] = useState(null);
  const [comments, setComments] = useState({});
  const [recordEdits, setRecordEdits] = useState({});
 const [usersort,setusersort]=useState(false)

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
    setEditRecordId(id);
    const record = attendanceData.find(record => record.id === id);
    setRecordEdits({
      in_time: record.in_time,
      out_time: record.out_time,
      date: record.date,
      status: record.status
    });
    setComments(prevComments => ({
      ...prevComments,
      [id]: record.comment || ''
    }));
    setEditCommentId(id);
  };

  const handleCommentChange = (id, event) => {
    setComments(prevComments => ({
      ...prevComments,
      [id]: event.target.value
    }));
  };

  const handleRecordChange = (field, event) => {
    setRecordEdits(prevEdits => ({
      ...prevEdits,
      [field]: event.target.value
    }));
  };

  const handleSaveComment = async (id) => {
    try {
      await axios.put(`http://localhost:7000/admin/savecomment/${id}`, {
        comment: comments[id]
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      setAttendanceData(prevData => prevData.map(record =>
        record.id === id ? { ...record, comment: comments[id] } : record
      ));
      setEditCommentId(null);
    } catch (error) {
      setError('An error occurred while saving the comment.');
      console.error("Error saving comment:", error);
    }
  };

  const handleSaveRecord = async (id) => {
    try {
      await axios.put(`http://localhost:7000/admin/saverecord/${id}`, {
        id,
        ...recordEdits
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      setAttendanceData(prevData => prevData.map(record =>
        record.id === id ? { ...record, ...recordEdits } : record
      ));
      setEditRecordId(null);
      setEditCommentId(null);
    } catch (error) {
      setError('An error occurred while saving the record.');
      console.error("Error saving record:", error);
    }
  };


  const handleCancelRecord = () => {
    setEditRecordId(null);
    setEditCommentId(null);
  };

  const handleDeleteButtonClick = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      deleteAttendance(id);
    }
  };

  const deleteAttendance = async (id) => {
    try {
      await axios.delete(`http://localhost:7000/admin/deleteattendance/${id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      setAttendanceData(prevData => prevData.filter(record => record.id !== id));
    } catch (error) {
      setError('An error occurred while deleting the record.');
      console.error("Error deleting record:", error);
    }
  };

  return (
    <div className='attendance-admin'>
      <div>



      </div>

      <div className='attendance-table'>
        <div className='attendance-table-container'>
          <table>
            <thead>
              <tr>
                <th>ID <FcAlphabeticalSortingAz/></th>
                <th>User ID <FcAlphabeticalSortingAz/></th>
                <th>Full Name <FcAlphabeticalSortingAz/></th>
                <th>In Time <FcAlphabeticalSortingAz/></th>
                <th>Out Time<FcAlphabeticalSortingAz/></th>
                <th>Date<FcAlphabeticalSortingAz/></th>
                <th>Status</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.user_id}</td>
                  <td>{record.fullname}</td>
                  <td>
                    {editRecordId === record.id ? (
                      <input
                        type="text"
                        value={recordEdits.in_time}
                        onChange={(e) => handleRecordChange('in_time', e)}
                      />
                    ) : (
                      record.in_time
                    )}
                  </td>
                  <td>
                    {editRecordId === record.id ? (
                      <input
                        type="text"
                        value={recordEdits.out_time}
                        onChange={(e) => handleRecordChange('out_time', e)}
                      />
                    ) : (
                      record.out_time
                    )}
                  </td>
                  <td>
                    {editRecordId === record.id ? (
                      <input
                        type="date"
                        value={recordEdits.date}
                        onChange={(e) => handleRecordChange('date', e)}
                      />
                    ) : (
                      formatDate(record.date)
                    )}
                  </td>
                  <td>
                    {editRecordId === record.id ? (
                      <select
                        value={recordEdits.status}
                        onChange={(e) => handleRecordChange('status', e)}
                      >
                        <option value="Absent">Absent</option>
                        <option value="Present">Present</option>
                        <option value="Halfday">Halfday</option>
                      </select>
                    ) : (
                      record.status === "Absent" ? (
                        <span className="badge text-bg-danger rounded-pill">A</span>
                      ) : record.status === "Halfday" ? (
                        <span className="badge text-bg-warning rounded-pill">HD</span>
                      ) : record.status === "present" ? (
                        <span className="badge text-bg-success rounded-pill">P</span>
                      ) : (
                        <span className="badge text-bg-secondary rounded-pill">Pending</span>
                      )
                    )}
                  </td>
                  <td>
                    {editCommentId === record.id ? (
                      <div>
                        {record.comment ? (
                          <textarea
                            value={comments[record.id] || ''}
                            onChange={(e) => handleCommentChange(record.id, e)}
                          />
                        ) : (
                          <textarea
                            type="text"
                            value={comments[record.id] || ''}
                            onChange={(e) => handleCommentChange(record.id, e)}
                          />
                        )}

                        <button onClick={() => handleSaveComment(record.id)}><MdOutlineDone /></button>
                        <button onClick={handleCancelRecord}><MdCancel /></button>
                      </div>
                    ) : (
                      <div>
                        {record.comment ? (
                          <span>{record.comment}</span>
                        ) : (
                          <span onClick={() => {
                            setEditCommentId(record.id);
                            setComments(prevComments => ({
                              ...prevComments,
                              [record.id]: ''
                            }));
                          }}>
                            <IoIosAdd />
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editRecordId === record.id ? (
                      <div>
                        <button onClick={() => handleSaveRecord(record.id)}><MdOutlineDone /></button>
                        <button onClick={handleCancelRecord}><MdCancel /></button>
                      </div>
                    ) : (
                      <div>
                        <span className="action-icon" onClick={() => handleDeleteButtonClick(record.id)}><MdDelete /></span>
                        <span className="action-icon" onClick={() => handleEditButtonClick(record.id)}><MdEdit /></span>
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
      
    </div>
  );
};

export default Attendance;
