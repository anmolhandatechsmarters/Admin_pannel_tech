import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../CSS/ShowUser.css"; // Ensure your CSS file is correctly located
import { MdDelete, MdEdit } from "react-icons/md";
import { FcAlphabeticalSortingAz, FcAlphabeticalSortingZa } from "react-icons/fc";
import Swal from 'sweetalert2'
const ShowAllUser = () => {
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



  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [usersort, setUsersort] = useState({ column: 'id', order: 'asc' });
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const logid = localStorage.getItem("id");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:7000/admin/showalluser", {
        params: { page, limit, search, sort: usersort, role },
        headers: { "Content-Type": "application/json" },
      });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, usersort, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    setUsersort(prevSort => ({
      column,
      order: prevSort.column === column && prevSort.order === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

  const deleteUser = async (id) => {
    const confirmDeleteUser = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
    });

    if (confirmDeleteUser.isConfirmed) {
        try {
            console.log("Deleting user with id:", id, "Log ID:", logid); // Log to check values
            const response = await axios.delete(`http://localhost:7000/admin/deleteuser/${id}`, {
                params: { logid,logip },
                headers: { "Content-Type": "application/json" }
            });

            if (response.status === 200) {
                setUsers(users.filter(user => user.id !== id));
                setTotal(total - 1);
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
            } else {
                console.error("Failed to delete user:", response.statusText);
                Swal.fire('Error!', 'Failed to delete user.', 'error');
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            Swal.fire('Error!', 'An error occurred while deleting the user.', 'error');
        }
    } else {
        Swal.fire('Cancelled', 'User is safe :)', 'info');
    }
};

  

  const userdataedit = (userid) => {
    navigate(`/edituser/${userid}`);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setPage(1);
  };

  const options = {
    roles: ['HR', 'Employee'],
  };

  const handleadduser = () => {
    navigate("/adduser");
  };

  const handleviewuser = (userid) => {
    navigate(`/viewuser/${userid}`);
  };

  return (
    <div className='showuser-admin'>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-primary" onClick={handleadduser}>Add User</button>
      </div>
      <div className="table-container mt-3">
        <div className="search-bar">
          <div className='admin-searchoptionfield'>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={handleSearch}
            />
            <select
              id="role"
              name="role"
              value={role}
              onChange={handleRoleChange}
            >
              <option value="">All</option>
              {options.roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
        {loading ? <p>Loading...</p> : (
          <>
            <table>
              <thead>
                <tr>
                  <th>
                    #id
                    <span onClick={() => handleSorting('id')}>
                      {usersort.column === 'id' ? (
                        usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                      ) : <FcAlphabeticalSortingAz />}
                    </span>
                  </th>
                  <th>
                    Full Name
                    <span onClick={() => handleSorting('first_name')}>
                      {usersort.column === 'first_name' ? (
                        usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                      ) : <FcAlphabeticalSortingAz />}
                    </span>
                  </th>
                  <th>
                    Email
                    <span onClick={() => handleSorting('email')}>
                      {usersort.column === 'email' ? (
                        usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                      ) : <FcAlphabeticalSortingAz />}
                    </span>
                  </th>
                  <th>
                    Employee ID
                    <span onClick={() => handleSorting('emp_id')}>
                      {usersort.column === 'emp_id' ? (
                        usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                      ) : <FcAlphabeticalSortingAz />}
                    </span>
                  </th>
                  <th>Role</th>
                  <th>
                    Last Login
                    <span onClick={() => handleSorting('last_login')}>
                      {usersort.column === 'last_login' ? (
                        usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                      ) : <FcAlphabeticalSortingAz />}
                    </span>
                  </th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                     <td className='viewuserbyfield' onClick={() => handleviewuser(user.id)}>
                        {user.id}
                      </td>
                      <td className='viewuserbyfield' onClick={() => handleviewuser(user.id)}>
                        {user.first_name} {user.last_name}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.emp_id}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.last_login).toLocaleString()}</td>
                      <td>
                        {user.status === '1' ?
                          <div><span className="badge text-bg-success text-light">Active</span></div> :
                          <div><span className="badge text-bg-danger text-light">InActive</span></div>
                        }
                      </td>
                      <td>
                        <MdDelete onClick={() => deleteUser(user.id)} style={{ cursor: 'pointer', color: 'red' }} />
                        <MdEdit onClick={() => userdataedit(user.id)} style={{ cursor: 'pointer', color: 'blue' }} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No users found</td>
                  </tr>
                )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ShowAllUser;
