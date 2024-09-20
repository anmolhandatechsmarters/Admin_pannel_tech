import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewUser.css'; // Import CSS for styling
import { FaCamera } from 'react-icons/fa';

function ViewUser() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [user, setUser] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeSection, setActiveSection] = useState('user'); // Track active section
  const { id } = useParams();
  const fileInputRef = useRef(null); // Ref for file input

  useEffect(() => {
    async function getUser() {
      try {
        const result = await axios.get(`http://localhost:7000/admin/viewuser/${id}`);
        setUser(result.data.user);
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    }

    const fetchAttendanceRecords = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/admin/viewuserattendence/${id}`);
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error('Error fetching attendance records', error);
      }
    };

    fetchAttendanceRecords();
    getUser();
  }, [id]);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !id) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      await axios.put(`http://localhost:7000/admin/upload/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error uploading image', error);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      handleImageUpload();
    }
  }, [selectedImage]);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const profileImageUrl = `http://localhost:7000/${user.image}`;

  const handleAttendanceUser = (userid) => {
    navigate(`/attendance/${userid}`);
  };

  const handleEditUser = (userid) => {
    navigate(`/edituser/${userid}`);
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toLocaleString();
  };

  return (
    <div className="main-container-view-user">
      <div className="sidebarss">
        <div className="profile">
          <div className="img">
            <img src={profileImageUrl} alt="Profile" />
          </div>
          <p>{user.emp_id}</p>
        </div>
        <div className="menu">
        <button
            onClick={() => handleEditUser(user.id)}
          >
            Edit User
          </button>
          <button
            onClick={() => handleAttendanceUser(user.emp_id)}
          >
            Attendance
          </button>
        </div>
      </div>
      <div className="content">
        {activeSection === 'user' && (
          <div className="user-info">
            <h2 className='text-center'>User Information</h2>
            <div className="container">
              <div className="row mb-3">
                <div className="col-6"><strong>Employee ID:</strong> {user.emp_id}</div>
                <div className="col-6"><strong>First Name:</strong> {user.first_name}</div>
              </div>
              <div className="row mb-3">
                <div className="col-6"><strong>Last Name:</strong> {user.last_name}</div>
                <div className="col-6"><strong>Email ID:</strong> {user.email}</div>
              </div>
              <div className="row mb-3">
                <div className="col-6"><strong>Role:</strong> {user.roleDetails ? user.roleDetails.role : 'N/A'}</div>
                <div className="col-6"><strong>Created By:</strong> {user.created_by}</div>
              </div>
              <div className="row mb-3">
                <div className="col-6"><strong>Status:</strong> {user.status === 1 ? "Inactive" : "Active"}</div>
                <div className="col-6"><strong>Country:</strong> {user.countryDetails ? user.countryDetails.name : 'N/A'}</div>
              </div>
              <div className="row mb-3">
                <div className="col-6"><strong>State:</strong> {user.stateDetails ? user.stateDetails.name : 'N/A'}</div>
                <div className="col-6"><strong>City:</strong> {user.cityDetails ? user.cityDetails.name : 'N/A'}</div>
              </div>
              <div className="row mb-3">
                <div className="col-6"><strong>IP:</strong> {user.ip}</div>
                <div className="col-6"><strong>Last Login:</strong> {formatDate(user.last_login)}</div>
              </div>
              <div className="row mb-3">
                <div className="col-6"><strong>Created On:</strong> {formatDate(user.created_on)}</div>
                <div className="col-6"><strong>Updated On:</strong> {formatDate(user.updated_on)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewUser;
