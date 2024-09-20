import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import './AdminEditProfile.css';
import countriesData from "../../pages/register/countries.json";
import statesData from "../../pages/register/states.json";
import citiesData from "../../pages/register/cities.json";
import { FaCamera } from 'react-icons/fa'; // Import camera icon

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [logip, setIpAddress] = useState('');
  const logid = localStorage.getItem("id");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    state: '',
    city: '',
    street1: '',
    street2: ''
  });

  const [options, setOptions] = useState({
    countries: [],
    states: [],
    cities: []
  });

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/user/getuserprofile/${id}`, {
          params: { logid, logip },
          headers: { "Content-Type": 'application/json' }
        });
        const userData = response.data[0];
        setUser(userData);
        setImage(userData.image);
        setFormData({
          firstName: userData.first_name,
          lastName: userData.last_name,
          country: userData.countryDetails.id,
          state: userData.stateDetails.id,
          city: userData.cityDetails.id,
          street1: userData.street1,
          street2: userData.street2
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [id, logid, logip]);

  useEffect(() => {
    setOptions({
      countries: countriesData.countries,
      states: statesData.states,
      cities: citiesData.cities
    });
  }, []);

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
        await axios.put(`http://localhost:7000/admin/updateUser/${id}`, formData, {
          params: { logid, logip },
          headers: { "Content-Type": "application/json" }
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'User details updated successfully',
          confirmButtonText: 'OK'
        });
        navigate("/dashboard");
      } catch (error) {
        console.error('Error updating user:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Failed to update user details: ' + (error.response?.data?.message || error.message),
          confirmButtonText: 'Try Again'
        });
      }
    }
  };

  const profileImageSrc = `http://localhost:7000/${user?.image}`;

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);

      try {
        const formData = new FormData();
        formData.append('image', file);

        await axios.put(`http://localhost:7000/admin/upload/${user.id}`, formData, {
          params: { logid, logip },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Refresh user data after successful upload
        const result = await axios.get(`http://localhost:7000/user/getuserprofile/${id}`, {
          params: { logid, logip }
        });
        setUser(result.data[0]);
      } catch (error) {
        console.error('Error uploading image', error);
      }
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <div className="profile-image-container">
        <label className="image-upload-label" onClick={handleCameraClick}>
          {image ? (
            <img src={profileImageSrc} alt="Profile" className="profile-image" />
          ) : (
            <FaCamera className="camera-icon" />
          )}
        </label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          className="image-upload-input"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
      </div>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label>Employee ID:</label>
          <p>{user.emp_id}</p>
        </div>
        <div className="form-group">
          <label>Role:</label>
          <p>{user.role}</p>
        </div>
        <div className="form-group">
          <label>Department:</label>
          <p>{user.department}</p>
        </div>
        <div className="form-group">
          <label>Designation:</label>
          <p>{user.designation}</p>
        </div>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
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
        <div className="form-group">
          <label>Street 1:</label>
          <input
            type="text"
            name="street1"
            value={formData.street1}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Street 2:</label>
          <input
            type="text"
            name="street2"
            value={formData.street2}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="submit-button">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
