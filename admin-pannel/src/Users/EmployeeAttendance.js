import React, { useState } from 'react';
import './CSS/EmployeeAttendance.css'; // Assuming you have a CSS file for styling

const AttendanceTable = () => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Example data for the table
  const data = [
    { date: '2024-09-01', intime: '09:00', outtime: '17:00', status: 'Present' },
    { date: '2024-09-02', intime: '09:15', outtime: '17:05', status: 'Late' },
    // Add more data as needed
  ];

  const filteredData = data.filter(row => {
    const rowDate = new Date(row.date);
    const isWithinDateRange = (!startDate || rowDate >= new Date(startDate)) && (!endDate || rowDate <= new Date(endDate));
    return isWithinDateRange;
  });

  const count = filteredData.length;

  return (
    <div className="attendance-container">
      <div className="filters">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Month</option>
          <option value="01">January</option>
          <option value="02">February</option>
          {/* Add other months */}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Year</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          {/* Add other years */}
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

        <div className="count-box">
          <span>Total Count: {count}</span>
        </div>
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
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.intime}</td>
              <td>{row.outtime}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
