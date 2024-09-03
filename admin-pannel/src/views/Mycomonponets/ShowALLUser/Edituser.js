import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import countriesData from "../../pages/register/countries.json";
import statesData from "../../pages/register/states.json";
import citiesData from "../../pages/register/cities.json";

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
    city: ''
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
          city: userData.city
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
      // Filter states based on selected country
      const filteredStates = statesData.states.filter(state => state.country_id === value);
      setOptions(prevOptions => ({
        ...prevOptions,
        states: filteredStates,
        cities: [] // Clear cities when country changes
      }));
      setFormData(prevFormData => ({ ...prevFormData, state: '', city: '' }));
    }

    if (name === 'state') {
      // Filter cities based on selected state
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
    try {
      await axios.put(`http://localhost:7000/admin/updateuser/${id}`, formData, {
        headers: { "Content-Type": "application/json" }
      });
      alert('User updated successfully');
    } catch (error) {
      console.error("Error updating user:", error);
      // Handle error appropriately, e.g., show a message to the user
      alert('Failed to update user: ' + error.response?.data?.message || error.message);
    }
  };
  

  return (
    <div>
      <h1>Edit User</h1>
      {user ? (
        <>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div>
                <label>First Name:</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Last Name:</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Employee ID:</label>
                <input
                  type="text"
                  name="emp_id"
                  value={formData.emp_id}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Role:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a role</option>
                  {options.roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Country:</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a country</option>
                  {options.countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>

                <label>State:</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a state</option>
                  {options.states
                    .filter(state => state.country_id === formData.country)
                    .map(state => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label>City:</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a city</option>
                  {options.cities
                    .filter(city => city.state_id === formData.state)
                    .map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                </select>
              </div>
              <button type="submit">Update User</button>
              <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          ) : (
            <div>
              <p><strong>First Name:</strong> {user.first_name}</p>
              <p><strong>Last Name:</strong> {user.last_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Employee ID:</strong> {user.emp_id}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Country:</strong> {user.country}</p>
              <p><strong>State:</strong> {user.state}</p>
              <p><strong>City:</strong> {user.city}</p>
              <button onClick={() => setIsEditing(true)}>Edit</button>
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EditUser;
