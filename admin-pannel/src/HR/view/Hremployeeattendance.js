import React, { useEffect, useState } from 'react';
import "./Css/Hrattendance.css";
import axios from "axios";
import { MdDelete, MdEdit, MdOutlineDone, MdCancel } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { FcAlphabeticalSortingAz, FcAlphabeticalSortingZa } from "react-icons/fc";
import { useNavigate, useParams} from 'react-router-dom';

const Attendance = () => {
  const Navigate = useNavigate()
  const userids = useParams()
  const userid=userids.id
  console.log(userid)
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
        const response = await axios.get("http://localhost:7000/api/hr/showemployeeattendance", {
          params: { page, limit, search, sort: userSort, month: monthFilter, year: yearFilter, startDate, endDate, status: statusFilter,userid},
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
  }, [page, userSort, search, monthFilter, yearFilter, startDate, endDate, statusFilter]);

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
    try {
      await axios.put(`http://localhost:7000/admin/savecomment/${id}`, {
        comment: comments[id]
      }, {
        headers: { "Content-Type": "application/json" }
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
        headers: { "Content-Type": "application/json" }
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
        headers: { "Content-Type": "application/json" }
      });

      setAttendanceData(prevData => prevData.filter(record => record.id !== id));
      setTotal(prevTotal => prevTotal - 1);
    } catch (error) {
      setError('An error occurred while deleting the record.');
      console.error("Error deleting record:", error);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];
  const status = ['Present', 'Absent', 'Halfday'];

  const years = Array.from(new Set(attendanceData.map(record => new Date(record.date).getFullYear())));

  const handleviewuser = (id) => {
    Navigate(`/viewhruser/${id}`)
  }



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
          </select>
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
                  <td>{record.id}</td>
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
