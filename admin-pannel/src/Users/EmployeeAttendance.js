import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CSS/EmployeeAttendance.css'; // Assuming you have a CSS file for styling

const AttendanceTable = () => {
  const id = localStorage.getItem("id");
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userattendance, setUserAttendance] = useState([]);
  const [countattendance, setCountAttendance] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const result = await axios.get(`http://localhost:7000/api/employee/getattendance/${id}`, {
          params: {
            page,
            limit,
            month: monthFilter || undefined,
            year: yearFilter || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            status: statusFilter || undefined
          },
          headers: {
            "Content-Type": "application/json"
          }
        });
       setCountAttendance(result.data.count)
        setUserAttendance(result.data.data);
        setTotal(result.data.totalCount);
      } catch (error) {
        console.log(error);
      }
    };

    
    

    fetchAttendance();
 
  }, [id, monthFilter, yearFilter, startDate, endDate, statusFilter, page]);

  // Calculate the years from the user attendance data
  const years = Array.from(new Set(userattendance.map(record => new Date(record.date).getFullYear())));
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];

  const statusOptions = ['Present', 'Absent', 'Halfday'];

  const handleMonthChange = (e) => setMonthFilter(e.target.value);
  const handleYearChange = (e) => setYearFilter(e.target.value);
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  return (
    <div className="attendance-container">
      <div className="filters">
        <select value={monthFilter} onChange={handleMonthChange}>
          <option value="">All Months</option>
          {months.map((item, index) => (
            <option key={index} value={index + 1}>{item}</option>
          ))}
        </select>

        <select value={yearFilter} onChange={handleYearChange}>
          <option value="">Year</option>
          {years.length > 0 ? (
            years.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))
          ) : (
            <option value="">No years available</option>
          )}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <select value={statusFilter} onChange={handleStatusChange}>
          <option value="">Status</option>
          {statusOptions.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>

        {/* <div className="count-box">
          <span>Total Attendance: {countattendance}</span>
        </div> */}
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Intime</th>
            <th>Outtime</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {userattendance.map((user, index) => (
            <tr key={index}>
              <td>{new Date(user.date).toLocaleDateString()}</td>
              <td>{user.in_time}</td>
              <td>{user.out_time}</td>
              <td>{user.status}</td>
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
    </div>
  );
};

export default AttendanceTable;
