import React, { useEffect, useRef, useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';
import './CSS/Detailemployee.css';

const Detailemployee = () => {
  const [imageSrc, setImageSrc] = useState('');
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAttendance, setUserAttendance] = useState({});
  const fileInputRef = useRef(null);
  const id = localStorage.getItem('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee details
        const userResult = await axios.get(`http://localhost:7000/api/employee/employeedetail/${id}`, {
          headers: {
            "Content-Type": 'application/json'
          }
        });
        setUser(userResult.data.user);

        // Fetch user attendance details
        const attendanceResult = await axios.get(`http://localhost:7000/api/employee/userattendance/${id}`, {
          headers: {
            "Content-Type": "application/json"
          }
        });
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

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageSrc(reader.result); // Update image source
      reader.readAsDataURL(file); // Read the file as data URL
    }
  };

  const handleMarkAttendance = async () => {
    try {
      await axios.put(`http://localhost:7000/api/employee/markattendance/${id}`);
      // Refresh attendance data
      const result = await axios.get(`http://localhost:7000/api/employee/userattendance/${id}`);
      setUserAttendance(result.data);
    } catch (error) {
      console.error('Failed to mark attendance', error);
    }
  };

  const handleUnmarkAttendance = async () => {
    try {
      await axios.put(`http://localhost:7000/api/employee/unmarkattendance/${id}`);
      // Refresh attendance data
      const result = await axios.get(`http://localhost:7000/api/employee/userattendance/${id}`);
      setUserAttendance(result.data);
    } catch (error) {
      console.error('Failed to unmark attendance', error);
    }
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
      // Refresh user data
      const result = await axios.get(`http://localhost:7000/api/employee/employeedetail/${id}`);
      setUser(result.data.user);
    } catch (error) {
      console.error('Error uploading image', error);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      handleImageUpload();
    }
  }, [selectedImage]);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const profileImageUrl = user?.Image ? `http://localhost:7000/${user.Image}` : EmpImg; // Default image if none available

  return (
    <div className='employee-Main-box'>
      <div className='employeeImage'>
        <img src={profileImageUrl} alt="Profile" />
        {user?.Image && <FaCamera className="camera-icon" onClick={handleCameraClick} />}
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef} // Attach ref to file input
          style={{ display: 'none' }} // Hide the file input
        />
        {user && <p>Emp Id: {user.emp_id}</p>}
      </div>

      <div className='employeedetail'>
        {user && (
          <>
            <p>Name: {user.first_name} {user.last_name}</p>
            <p>Role: {user.Role ? user.Role.role : 'N/A'}</p>
            <p>Status: {user.status === '1' ? 'Active' : 'Inactive'}</p>
            <p>In Time: {userAttendance.in_time || "Mark Attendance"}</p>
            <p>Out Time: {userAttendance.out_time || "Logout"}</p>
            <p>Today Attendance: {userAttendance.status || "Pending"}</p>
          </>
        )}

        {!userAttendance.in_time ? (
          <button onClick={handleMarkAttendance}>Mark Attendance</button>
        ) : userAttendance.in_time && !userAttendance.out_time ? (
          <button onClick={handleUnmarkAttendance}>Logout</button>
        ) : (
          <button onClick={() => alert("Call HR to change the field")}>Disable</button>
        )}
      </div>
    </div>
  );
};

export default Detailemployee;
