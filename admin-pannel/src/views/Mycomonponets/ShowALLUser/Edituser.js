import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { MdEdit } from 'react-icons/md';
import countriesData from "../../pages/register/countries.json";
import statesData from "../../pages/register/states.json";
import citiesData from "../../pages/register/cities.json";
import '../CSS/EditUser.css'; // Import the CSS file

const EditUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    emp_id: '',
    role: '',
    country: '',
    state: '',
    city: '',
    street1: '',
    street2: '',
    status: ''
  });
  const [options, setOptions] = useState({
    roles: ['HR', 'Employee'],
    countries: [],
    states: [],
    cities: []
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load countries, states, and cities data
    setOptions(prevOptions => ({
      ...prevOptions,
      countries: countriesData.countries,
      states: statesData.states,
      cities: citiesData.cities
    }));
  }, []);

  useEffect(() => {
    // Fetch user data by ID
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/admin/getuser/${id}`);
        const userData = response.data;
        setUser(userData);
        setFormData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          emp_id: userData.emp_id,
          role: userData.role,
          country: userData.country,
          state: userData.state,
          city: userData.city,
          street1: userData.street1,
          street2: userData.street2,
          status: userData.status
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'country') {
      const filteredStates = statesData.states.filter(state => state.country_id === value);
      setOptions(prevOptions => ({
        ...prevOptions,
        states: filteredStates,
        cities: [] // Clear cities when country changes
      }));
      setFormData(prevFormData => ({ ...prevFormData, state: '', city: '' }));
    }

    if (name === 'state') {
      const filteredCities = citiesData.cities.filter(city => city.state_id === value);
      setOptions(prevOptions => ({
        ...prevOptions,
        cities: filteredCities
      }));
      setFormData(prevFormData => ({ ...prevFormData, city: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (window.confirm('Do you want to update the user details?')) {
      try {
        await axios.put(`http://localhost:7000/admin/updateUser/${id}`, formData, {
          headers: { "Content-Type": "application/json" }
        });
        alert('User details updated successfully');
        setIsEditing(false); // Exit edit mode after successful update
      } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user details: ' + error.response?.data?.message || error.message);
      }
    }
  };

  return (
    <div className="alluseredit-container">
      <h1 className="alluseredit-heading">Edit User</h1>
      {user ? (
        <form onSubmit={handleSubmit} className="alluseredit-form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name:</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name:</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="emp_id">Employee ID:</label>
              <input
                type="text"
                id="emp_id"
                name="emp_id"
                value={formData.emp_id}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select a role</option>
                {options.roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="country">Country:</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select a country</option>
                {options.countries.map(country => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State:</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select a state</option>
                {options.states
                  .filter(state => state.country_id === formData.country)
                  .map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="city">City:</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select a city</option>
                {options.cities
                  .filter(city => city.state_id === formData.state)
                  .map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="street1">Street 1:</label>
              <input
                type="text"
                id="street1"
                name="street1"
                value={formData.street1}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="street2">Street 2:</label>
              <input
                type="text"
                id="street2"
                name="street2"
                value={formData.street2}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          {isEditing ? (
            <div>
              <button type="submit">Save</button>
              <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)}>
              <MdEdit /> Edit
            </button>
          )}
        </form>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default EditUser;
