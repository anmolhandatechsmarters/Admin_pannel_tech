import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../CSS/ShowUser.css";
import { MdDelete } from "react-icons/md";
import Swal from 'sweetalert2';
import {useNavigate} from "react-router-dom"
const ShowAllUser = () => {
  const navigate=useNavigate()
  const [log, setLog] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchAllLogs = async () => {
      try {
        const result = await axios.get("http://localhost:7000/admin/logs", {
          params: { page, limit, search },
          headers: { "Content-Type": "application/json" },
        });
        setLog(result.data.logs);
        setTotal(result.data.total); // Update total with the response
      } catch (error) {
        console.log(error);
      }
    };

    fetchAllLogs();
  }, [page, limit, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };



  const handledeletelog = async (id) => {
      const confirm = await Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
      });
  
      if (confirm.isConfirmed) {
          try {
              const results = await axios.delete(`http://localhost:7000/admin/logdelete/${id}`);
              Swal.fire({
                  icon: 'success',
                  title: 'Deleted!',
                  text: 'Your log has been deleted.',
                  confirmButtonText: 'OK'
              });
  
              // Fetch updated logs
              const result = await axios.get("http://localhost:7000/admin/logs", {
                  params: { page, limit, search },
                  headers: { "Content-Type": "application/json" },
              });
              setLog(result.data.logs);
              setTotal(result.data.total);
          } catch (error) {
              console.error(error);
              Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'There was an error deleting the log.',
                  confirmButtonText: 'OK'
              });
          }
      } else {
          console.log("Deletion cancelled");
      }
  };
  const handleviewuser = (userid) => {
    navigate(`/viewuser/${userid}`);
  };
  

  return (
    <div className='showuser-admin'>
      <div className="table-container mt-3">
        <div className="search-bar">
          <div className='admin-searchoptionfield'>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>User Id</th>
              <th>Api</th>
              <th>Message</th>
              <th>IP</th>
              <th>Date</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {log.map((userlog) => (
              <tr key={userlog.id}>
                < td className='viewuserbyfield' onClick={() => handleviewuser(userlog.user_id)}>
                        {userlog.id}
                      </td>
                < td className='viewuserbyfield' onClick={() => handleviewuser(userlog.user_id)}>
                        {userlog.user_id}
                      </td>
                <td>{userlog.api}</td>
                <td>{userlog.message}</td>
                <td>{userlog.ip}</td>
                <td>{userlog.date}</td>
                <td>{userlog.time}</td>
    <td><span onClick={()=>handledeletelog(userlog.id)}><MdDelete /></span></td>
                </tr>
            ))}
            
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
            Previous
          </button>
          <span>Page {page} of {Math.ceil(total / limit)}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === Math.ceil(total / limit)} aria-label="Next page">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowAllUser;
