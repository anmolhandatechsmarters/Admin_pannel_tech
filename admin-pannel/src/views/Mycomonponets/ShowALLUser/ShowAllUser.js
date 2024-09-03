import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../CSS/ShowUser.css"; // Ensure your CSS file is correctly located
import { MdDelete, MdDownloadDone, MdCancel } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import countries from "../../pages/register/countries.json";
import states from "../../pages/register/states.json";
import cities from "../../pages/register/cities.json";
import { FcAlphabeticalSortingAz, FcAlphabeticalSortingZa } from "react-icons/fc";

const ShowAllUser = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [usersort, setUsersort] = useState({ column: 'id', order: 'asc' }); // Added sorting state
  const limit = 10; // Number of items per page

  // Fetch users data
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
  }, [page, search, usersort]); // Added usersort to dependency array

  // Handle search input change
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  // Handle sorting
  const handleSorting = (column) => {
    setUsersort(prevSort => ({
      column,
      order: prevSort.column === column && prevSort.order === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

  // Delete a user
  const deleteUser = async (id) => {
    const confirmDeleteUser = window.confirm("Are you sure you want to delete this user?");
    if (confirmDeleteUser) {
      try {
        await axios.delete(`http://localhost:7000/admin/deleteuser/${id}`, {
          headers: { "Content-Type": "application/json" }
        });
        // Refetch users list
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

  // Handle input changes for user data
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Start editing a user
  const startEditing = (user) => {
    setEditUserId(user.id);
    setEditUserData({ ...user });
  };

  // Save edited user data
  const saveChanges = async () => {
    console.log("Saving changes with data:", editUserData); // Debugging line

    try {
      const response = await axios.put(`http://localhost:7000/admin/updateuser/${editUserId}`, editUserData, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.status === 200) {
        // Refetch users list after saving changes
        const userResponse = await axios.get("http://localhost:7000/admin/showalluser", {
          params: { page, limit, search, sort: usersort }
        });
        setUsers(userResponse.data.users);
        setTotal(userResponse.data.total);
        setEditUserId(null);
      } else {
        throw new Error(response.data.message || 'Error updating user');
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Error updating user: ${error.response?.data?.message || error.message}`);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditUserId(null);
  };

  // Ensure these are arrays
  const countriesList = Array.isArray(countries) ? countries : [];
  const statesList = Array.isArray(states) ? states : [];
  const citiesList = Array.isArray(cities) ? cities : [];

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
              Country
              <span onClick={() => handleSorting('country')}>
                {usersort.column === 'country' ? (
                  usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                ) : <FcAlphabeticalSortingAz />}
              </span>
            </th>
            <th>
              State
              <span onClick={() => handleSorting('state')}>
                {usersort.column === 'state' ? (
                  usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                ) : <FcAlphabeticalSortingAz />}
              </span>
            </th>
            <th>
              City
              <span onClick={() => handleSorting('city')}>
                {usersort.column === 'city' ? (
                  usersort.order === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />
                ) : <FcAlphabeticalSortingAz />}
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
                <td>
                  {editUserId === user.id ? (
                    <input
                      type="text"
                      name="first_name"
                      value={editUserData.first_name || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    user.first_name
                  )}
                </td>
                <td>
                  {editUserId === user.id ? (
                    <input
                      type="text"
                      name="last_name"
                      value={editUserData.last_name || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    user.last_name
                  )}
                </td>
                <td>
                  {editUserId === user.id ? (
                    <input
                      type="text"
                      name="email"
                      value={editUserData.email || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editUserId === user.id ? (
                    <input
                      type="text"
                      name="employeeid"
                      value={editUserData.emp_id || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    user.emp_id
                  )}
                </td>
                <td>
                  {editUserId === user.id ? (
                    <select
                      name="role"
                      value={editUserData.role || ''}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select a role</option>
                      {['HR','Employee'].map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editUserId === user.id ? (
                    <select
                      name="country"
                      value={editUserData.country || ''}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select a country</option>
                      {countriesList.map(country => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  ) : (
                    user.country
                  )}
                </td>
                <td>
                  {editUserId === user.id ? (
                    <select
                      name="state"
                      value={editUserData.state || ''}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select a state</option>
                      {statesList
                        .filter(state => state.country_id === editUserData.country)
                        .map(state => (
                          <option key={state.id} value={state.id}>{state.name}</option>
                        ))}
                    </select>
                  ) : (
                    user.state
                  )}
                </td>
                <td>
                  {editUserId === user.id ? (
                    <select
                      name="city"
                      value={editUserData.city || ''}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select a city</option>
                      {citiesList
                        .filter(city => city.state_id === editUserData.state)
                        .map(city => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>
                  ) : (
                    user.city
                  )}
                </td>
                <td>{user.last_login}</td>
                <td>
                  {editUserId === user.id ? (
                    <>
                      <span onClick={saveChanges}><MdDownloadDone style={{ cursor: 'pointer', color: 'green' }} /></span>
                      <span onClick={handleCancel}><MdCancel style={{ cursor: 'pointer', color: 'red' }} /></span>
                    </>
                  ) : (
                    <span>
                      <MdDelete onClick={() => deleteUser(user.id)} style={{ cursor: 'pointer', color: 'red' }} />
                      <FaEdit onClick={() => startEditing(user)} style={{ cursor: 'pointer', color: 'blue' }} />
                    </span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11">No users found</td>
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
