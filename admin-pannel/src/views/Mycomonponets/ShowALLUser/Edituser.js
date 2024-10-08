import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import countriesData from "../../pages/register/countries.json";
import statesData from "../../pages/register/states.json";
import citiesData from "../../pages/register/cities.json";
import '../CSS/EditUser.css';
import Swal from 'sweetalert2';
const EditUser = () => {
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




  const { id } = useParams();
  const navigate = useNavigate();
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
    status: '',
    department: '',
    designation: '',
  });


  const [department, setdepartment] = useState([])
  const [designation, setdesignation] = useState([])

  const [options, setOptions] = useState({
    roles: ['HR', 'Employee'],
    countries: [],
    states: [],
    cities: [],

  });

  const logid = localStorage.getItem("id");

  useEffect(() => {
    setOptions(prevOptions => ({
      ...prevOptions,
      countries: countriesData.countries,
      states: statesData.states,
      cities: citiesData.cities,
   
    }));
  }, []);

  useEffect(() => {
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
          status: userData.status,
          department: userData.department,
          designation: userData.designation,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchdepartment = async () => {
      try {
          const result = await axios.get('http://localhost:7000/admin/getadmindepartment')
          setdepartment(result.data)
      } catch (error) {
          console.log(error)
      }

  }
  const fetchdesignaiton = async () => {
      try {
          const result = await axios.get('http://localhost:7000/admin/getadmindesignation')
          setdesignation(result.data)
      } catch (error) {
          console.log(error)
      }

  }
fetchdepartment()
fetchdesignaiton()



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
        cities: []
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
  
      // Confirmation alert
      const { value: confirm } = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to update the user details?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'Cancel'
      });
  
      if (confirm) {
          try {
              const response = await axios.put(`http://localhost:7000/admin/updateUser/${id}`, formData, {
                  params: { logid ,logip},
                  headers: { "Content-Type": "application/json" }
              });
              
              // Success alert
              Swal.fire({
                  icon: 'success',
                  title: 'Updated!',
                  text: response.data.message || 'User details updated successfully',
                  confirmButtonText: 'OK'
              });
              setTimeout(() => {
                navigate("/alluser")
              },2000);
          } catch (error) {
              console.error('Error updating user:', error);
  
              // Error alert for email already exists
              if (error.response && error.response.status === 400 && error.response.data.message.includes('Email is already in use.')) {
                  Swal.fire({
                      icon: 'error',
                      title: 'Oops!',
                      text: error.response.data.message || 'Email already exists.',
                      confirmButtonText: 'Try Again'
                  });
              } else {
                  // Generic error alert
                  Swal.fire({
                      icon: 'error',
                      title: 'Failed!',
                      text: 'Failed to update user details: ' + (error.response?.data?.message || error.message),
                      confirmButtonText: 'Try Again'
                  });
              }
          }
      }
  };
  

const handleCancel=()=>{
  navigate("/alluser")
}



  return (
    <div className='editsuer-admin'>
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
            <div className="row">
              <div className="col">
                <label>Department:</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
       
                >
                  <option value="">Select a department</option>
                  {department
                    .map(department => (
                      <option key={department.id} value={department.id}>
                        {department.department_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col">
                <label>Designation:</label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                >
                  <option value="">Select a designation</option>
                  {designation
                    .map(designation => (
                      <option key={designation.id} value={designation.id}>
                        {designation.designation_name}
                      </option>
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
                />
              </div>
            </div>
            <div>
              <button type="submit">Save</button>
              <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default EditUser;
