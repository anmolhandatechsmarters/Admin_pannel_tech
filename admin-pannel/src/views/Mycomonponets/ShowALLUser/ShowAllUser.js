import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../CSS/ShowUser.css"; // Ensure your CSS file is correctly located
import { MdDelete, MdEdit } from "react-icons/md";
import { FcAlphabeticalSortingAz, FcAlphabeticalSortingZa } from "react-icons/fc";

const ShowAllUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [usersort, setUsersort] = useState({ column: 'id', order: 'asc' });
  const limit = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:7000/admin/showalluser", {
          params: { page, limit, search, sort: usersort },
          headers: { "Content-Type": "application/json" },
        });
        setUsers(response.data.users);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [page, search, usersort]);

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
    const confirmDeleteUser = window.confirm("Are you sure you want to delete this user?");
    if (confirmDeleteUser) {
      try {
        await axios.delete(`http://localhost:7000/admin/deleteuser/${id}`, {
          headers: { "Content-Type": "application/json" }
        });
        const response = await axios.get("http://localhost:7000/admin/showalluser", {
          params: { page, limit, search, sort: usersort }
        });
        setUsers(response.data.users);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const userdataedit = (userid) => {
    navigate(`/edituser/${userid}`);
  };

  return (
    <div className="table-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={handleSearch}
        />
      </div>
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
              First Name
              <span onClick={() => handleSorting('first_name')}>
                {usersort.column === 'first_name' ? (
                  usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                ) : <FcAlphabeticalSortingAz />}
              </span>
            </th>
            <th>
              Last Name
              <span onClick={() => handleSorting('last_name')}>
                {usersort.column === 'last_name' ? (
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
            <th>
              Role
              <span>
                <FcAlphabeticalSortingAz />
              </span>
            </th>
            <th>
              Last Login
              <span>
                <FcAlphabeticalSortingAz />
              </span>
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.emp_id}</td>
                <td>{user.role}</td>
                <td>{new Date(user.last_login).toLocaleString()}</td>
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
    </div>
  );
};

export default ShowAllUser;
