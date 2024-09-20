import React, { useEffect, useRef, useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';
import './Css/Hrdetail.css';

const Detailemployee = () => {
  const [logip, setIpAddress] = useState('');
  const [user, setUser] = useState(null);
  const [userAttendance, setUserAttendance] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const id = localStorage.getItem('id');
  const logid = localStorage.getItem('id');

  // Fetch IP Address
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

  // Fetch User and Attendance Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await axios.get(`http://localhost:7000/api/hr/gethrdata/${id}`);
        setUser(userResult.data.user);

        const attendanceResult = await axios.get(`http://localhost:7000/api/employee/userattendance/${id}`);
        setUserAttendance(attendanceResult.data);
      } catch (error) {
        setError('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append('image', file);

        await axios.put(`http://localhost:7000/admin/upload/${user.id}`, formData, {
          params: { logid, logip },
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Refresh user data after successful upload
        const result = await axios.get(`http://localhost:7000/api/employee/employeedetail/${id}`);
        setUser(result.data.user);
      } catch (error) {
        console.error('Error uploading image', error);
        setError('Failed to upload image');
      }
    }
  };

  const handleMarkAttendance = async () => {
    try {
      await axios.post(`http://localhost:7000/api/employee/markattendance/${id}`);
      const result = await axios.get(`http://localhost:7000/api/employee/userattendance/${id}`);
      setUserAttendance(result.data);
    } catch (error) {
      console.error('Failed to mark attendance', error);
      setError('Failed to mark attendance');
    }
  };

  const handleUnmarkAttendance = async () => {
    try {
      await axios.put(`http://localhost:7000/api/employee/unmarkattendance/${id}`);
      const result = await axios.get(`http://localhost:7000/api/employee/userattendance/${id}`);
      setUserAttendance(result.data);
    } catch (error) {
      console.error('Failed to unmark attendance', error);
      setError('Failed to unmark attendance');
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  const profileImageUrl = user ? `http://localhost:7000/${user.image}` : '';

  return (
    <div className='employee-Main-box'>
      <div className='employeeImage'>
        <img src={profileImageUrl} alt="Profile" />
        <FaCamera className="camera-icon" onClick={handleCameraClick} />
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        {user && <p>Emp Id: {user.emp_id}</p>}
      </div>

      <div className='employeedetail'>
        {user && (
          <>
            <div className="detail-row">
              <span className="detail-title">Name:</span>
              <span className="detail-value">{user.first_name} {user.last_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-title">Role:</span>
              <span className="detail-value">{user.roleDetails ? user.roleDetails.role : 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-title">Status:</span>
              <span className="detail-value">{user.status === '1' ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-title">In Time:</span>
              <span className="detail-value">{userAttendance.in_time || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-title">Out Time:</span>
              <span className="detail-value">{userAttendance.out_time || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-title">Today Attendance:</span>
              <span className="detail-value">
                {userAttendance.status === "Present" ? (
                  <span className="badge badge-success">Present</span>
                ) : userAttendance.status === "Absent" ? (
                  <span className="badge badge-danger">Absent</span>
                ) : userAttendance.status === "Halfday" ? (
                  <span className="badge badge-warning">Halfday</span>
                ) : (
                  <span className="badge badge-secondary">Pending</span>
                )}
              </span>
            </div>
          </>
        )}

        {/* Attendance buttons */}
        <div>
          {!userAttendance.in_time ? (
            <button onClick={handleMarkAttendance}>Mark Attendance</button>
          ) : userAttendance.in_time && !userAttendance.out_time ? (
            <button onClick={handleUnmarkAttendance}>Out Time</button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Detailemployee;
