import React, { useEffect, useState } from 'react';
import "../CSS/Attendancetable.css";
import axios from "axios";
import { MdDelete, MdEdit, MdOutlineDone, MdCancel, MdEmojiEmotions } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { FcAlphabeticalSortingAz, FcAlphabeticalSortingZa } from "react-icons/fc";
import { useNavigate, useParams} from 'react-router-dom';
import Swal from 'sweetalert2'
const Attendance = () => {

  useEffect(() => {
    const fetchIpAddress = async () => {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setIpAddress(response.data.ip);
        } catch (error) {
            console.error('Error fetching IP address:', error);
        }
    };

    fetchIpAddress();
}, []);




const [logip, setIpAddress] = useState('');





  const Navigate = useNavigate()
  const userids = useParams()
  const empid=userids.id
 const logid=localStorage.getItem("id")
  const role=localStorage.getItem("role")
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editRecordId, setEditRecordId] = useState(null);
  const [comments, setComments] = useState({});
  const [search, setSearch] = useState('');
  const [recordEdits, setRecordEdits] = useState({});
  const [userSort, setUserSort] = useState({ column: 'id', order: 'asc' });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;



  useEffect(() => {
    async function fetchAttendance() {
      try {
        const response = await axios.get("http://localhost:7000/admin/getattendance", {
          params: { page, limit, search, sort: userSort, month: monthFilter, year: yearFilter, startDate, endDate, status: statusFilter,empid,role},
          headers: { "Content-Type": "application/json" }
        });

        if (response.data.success) {
          setAttendanceData(response.data.attendance);
          console.log(response.data.attendance)
          setTotal(response.data.total);
        } else {
          setError('Failed to fetch data.');
        }
      } catch (error) {
        setError('An error occurred while fetching data.');
        console.error("Error fetching attendance data:", error);
      }
    }

    fetchAttendance();
  }, [page, userSort, search, monthFilter, yearFilter, startDate, endDate, statusFilter,role]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  const handleSorting = (column) => {
    setUserSort(prevSort => ({
      column,
      order: prevSort.column === column && prevSort.order === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

  const handleMonthChange = (e) => {
    setMonthFilter(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
    setPage(1);
  };


  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPage(1);
  };


  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPage(1);
  };

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
      // Show confirmation dialog
      const result = await Swal.fire({
          title: 'Are you sure?',
          text: "Do you want to save this comment?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, save it!',
          cancelButtonText: 'No, cancel!'
      });
  
      // If the user confirmed, proceed with saving the comment
      if (result.isConfirmed) {
          try {
              await axios.put(`http://localhost:7000/admin/savecomment/${id}`,
                  {
                      comment: comments[id]
                  },
                  {
                      params: { logid, logip },
                      headers: { "Content-Type": "application/json" }
                  }
              );
  
              // Update state with the new comment
              setAttendanceData(prevData => prevData.map(record =>
                  record.id === id ? { ...record, comment: comments[id] } : record
              ));
              setEditCommentId(null);
  
              // Show success alert
              Swal.fire({
                  icon: 'success',
                  title: 'Saved!',
                  text: 'The comment has been saved.',
                  confirmButtonText: 'OK'
              });
          } catch (error) {
              setError('An error occurred while saving the comment.');
              console.error("Error saving comment:", error);
  
              // Show error alert
              Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'Failed to save the comment. Please try again.',
                  confirmButtonText: 'OK'
              });
          }
      }
  };
  


  const handleSaveRecord = async (id) => {
      // Show confirmation dialog
      const result = await Swal.fire({
          title: 'Are you sure?',
          text: "Do you want to save this record?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, save it!',
          cancelButtonText: 'No, cancel!'
      });
  
      // If the user confirmed, proceed with saving the record
      if (result.isConfirmed) {
          try {
              await axios.put(`http://localhost:7000/admin/saverecord/${id}`, {
                  id,
                  ...recordEdits
              }, {
                  params: { logid, logip },
                  headers: { "Content-Type": "application/json" }
              });
  
              // Update state with the new record
              setAttendanceData(prevData => prevData.map(record =>
                  record.id === id ? { ...record, ...recordEdits } : record
              ));
              setEditRecordId(null);
              setEditCommentId(null);
  
              // Show success alert
              Swal.fire({
                  icon: 'success',
                  title: 'Saved!',
                  text: 'The record has been saved.',
                  confirmButtonText: 'OK'
              });
          } catch (error) {
              setError('An error occurred while saving the record.');
              console.error("Error saving record:", error);
  
              // Show error alert
              Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'Failed to save the record. Please try again.',
                  confirmButtonText: 'OK'
              });
          }
      }
  };
  

  const handleCancelRecord = () => {
    setEditRecordId(null);
    setEditCommentId(null);
  };

  const handleDeleteButtonClick = async (id) => {
    const confirmDelete = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel'
    });

    if (confirmDelete.isConfirmed) {
        deleteAttendance(id);
    } else {
        Swal.fire('Cancelled', 'Your record is safe!', 'info');
    }
};




const deleteAttendance = async (id) => {
    // Show confirmation dialog
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!'
    });

    // If the user confirmed, proceed with deletion
    if (result.isConfirmed) {
        try {
            await axios.delete(`http://localhost:7000/admin/deleteattendance/${id}`, {
                params: { logid, logip },
                headers: { "Content-Type": "application/json" }
            });

            // Update state to remove deleted attendance record
            setAttendanceData(prevData => prevData.filter(record => record.id !== id));
            setTotal(prevTotal => prevTotal - 1);

            // Show success alert
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The attendance record has been deleted.',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            setError('An error occurred while deleting the record.');
            console.error("Error deleting record:", error);

            // Show error alert
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete the record. Please try again.',
                confirmButtonText: 'OK'
            });
        }
    }
};


  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];
  const status = ['Present', 'Absent', 'Halfday'];

  const years = Array.from(new Set(attendanceData.map(record => new Date(record.date).getFullYear())));

  const handleviewuser = (id) => {
    Navigate(`/viewuser/${id}`)
  }
  const handledowloadattendance = async () => {
    try {
      const response = await axios.get("http://localhost:7000/admin/allattendancedownload", {
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Attendance.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      Swal.fire({
        icon: 'success',
        title: 'Download Successful!',
        text: 'Your attendance file has been downloaded.',
        showConfirmButton: false,
        timer: 2000
      });
      
    } catch (error) {
      console.error(error);
      
      Swal.fire({
        icon: 'error',
        title: 'Download Failed!',
        text: 'There was an error downloading the file.',
        confirmButtonText: 'Try Again'
      });
    }
  };


  return (
    <div className='attendance-admin'>
      <div className="search-bar">
        <div className="admin-searchoptionfield">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-options">
          <select value={monthFilter} onChange={handleMonthChange}>
            <option value="">All Months</option>
            {months.map((item, index) => (
              <option key={index} value={index + 1}>{item}</option>
            ))}
          </select>
          <select value={yearFilter} onChange={handleYearChange}>
            <option value="">All Years</option>
            {years.map((year, index) => (
              <option key={index} value={year}>{year}</option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            placeholder="End Date"
          />
          <select value={statusFilter} onChange={handleStatusChange}>
            <option value="">Status</option>
            {status.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>    // You can show an error message to the user here if needed
          <span><button onClick={handledowloadattendance}>Download Attendance</button></span>
        </div>
      </div>

      <div className='attendance-table'>
        <div className='attendance-table-container'>
          <table>
            <thead>
              <tr>
                <th>ID <span onClick={() => handleSorting('id')}>
                  {userSort.column === 'id' ? (
                    userSort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                  ) : <FcAlphabeticalSortingAz />}
                </span></th>
                <th>Employee<span onClick={() => handleSorting('fullname')}>
                  {userSort.column === 'fullname' ? (
                    userSort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                  ) : <FcAlphabeticalSortingAz />}
                </span></th>
                <th>In Time <span onClick={() => handleSorting('in_time')}>
                  {userSort.column === 'in_time' ? (
                    userSort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                  ) : <FcAlphabeticalSortingAz />}
                </span></th>
                <th>Out Time <span onClick={() => handleSorting('out_time')}>
                  {userSort.column === 'out_time' ? (
                    userSort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                  ) : <FcAlphabeticalSortingAz />}
                </span></th>
                <th>Date <span onClick={() => handleSorting('date')}>
                  {userSort.column === 'date' ? (
                    userSort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                  ) : <FcAlphabeticalSortingAz />}
                </span></th>
                <th>Status</th>

                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record.id}>
                                    <td className='viewuserbyfield'  onClick={() => handleviewuser(record.user_id)}>{record.id}</td>
                  <td className='viewuserbyfield'  onClick={() => handleviewuser(record.user_id)}>{record.fullname}</td>

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
                        {status.map((status, index) => (
                          <option key={index} value={status}>{status}</option>
                        ))}
                      </select>
                    ) : (
                      record.status === "Absent" ? (
                        <span className="badge text-bg-danger rounded-pill">A</span>
                      ) : record.status === "Halfday" ? (
                        <span className="badge text-bg-warning rounded-pill">HD</span>
                      ) : record.status === "Present" ? (
                        <span className="badge text-bg-success rounded-pill">P</span>
                      ) : (
                        <span className="badge text-bg-secondary rounded-pill">Pending</span>
                      )
                    )}
                  </td>
                 
                  <td>
                    {editCommentId === record.id ? (
                      <div>
                        <textarea
                          value={comments[record.id] || ''}
                          onChange={(e) => handleCommentChange(record.id, e)}
                        />
                        <span onClick={() => handleSaveComment(record.id)}><MdOutlineDone /></span>
                        <span onClick={handleCancelRecord}><MdCancel /></span>
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
                        <span onClick={() => handleSaveRecord(record.id)}><MdOutlineDone /></span>
                        <span onClick={handleCancelRecord}><MdCancel /></span>
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
          <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page} of {Math.ceil(total / limit)}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === Math.ceil(total / limit)}>
              Next
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
