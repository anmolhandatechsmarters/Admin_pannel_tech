import React, { useEffect, useRef, useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';
import './Css/Hrdetail.css';

const Detailemployee = () => {

  const [logip, setIpAddress] = useState('');
const logid=localStorage.getItem('id')
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
        const userResult = await axios.get(`http://localhost:7000/api/hr/gethrdata/${id}`);
        setUser(userResult.data.user);

        // Fetch user attendance details
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
      reader.onloadend = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append('image', file);

        await axios.put(`http://localhost:7000/admin/upload/${user.id}`, formData, {
          params: { logid,logip },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        window.location.reload()
        // Refresh user data after successful upload
        const result = await axios.get(`http://localhost:7000/api/employee/employeedetail/${id}`);
        setUser(result.data.user);
      } catch (error) {
        console.error('Error uploading image', error);
      }
    }
  };

  const handleMarkAttendance = async () => {
    try {
      await axios.post(`http://localhost:7000/api/employee/markattendance/${id}`);
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

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const profileImageUrl = user?.image ? `http://localhost:7000/${user.image}` : '/path/to/default/image.jpg'; // Default image path

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
            <p>Name: {user.first_name} {user.last_name}</p>
            <p>Role: {user.roleDetails ? user.roleDetails.role : 'N/A'}</p>
            <p>Status: {user.status === '1' ? 'Active' : 'Inactive'}</p>
            <p>In Time: {userAttendance.in_time}</p>
            <p>Out Time: {userAttendance.out_time}</p>
            <p>Today Attendance: {userAttendance.status}</p>
          </>
        )}

        {!userAttendance.in_time ? (
          <button onClick={handleMarkAttendance}>Mark Attendance</button>
        ) : userAttendance.in_time && !userAttendance.out_time ? (
          <button onClick={handleUnmarkAttendance}>Out Time</button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default Detailemployee;
