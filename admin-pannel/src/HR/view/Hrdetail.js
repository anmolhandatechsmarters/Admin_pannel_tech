import React, { useState, useRef, useEffect } from 'react';
import './Css/Hrdetail.css';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';
import EmpImg from '../../../src/assets/images/avatars/1.jpg';

const Hrdetail = () => {
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(EmpImg);

  const fileInputRef = useRef(null);
  const id = localStorage.getItem('id');

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await axios.get(`http://localhost:7000/api/hr/gethrdata/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log(result.data.user)
        setUser(result.data.user);
        // Assuming that the user object has an Image property that holds the image URL
        if (result.data.Image) {
          setImageSrc(`http://localhost:7000/${result.data.Image}`);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, [id]); // Adding id as a dependency so it fetches data when id changes

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

        await axios.put(`http://localhost:7000/admin/upload/${user.emp_id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Refresh user data after successful upload
        const result = await axios.get(`http://localhost:7000/api/hr/gethrdata/${id}`);
        
        setUser(result.data);
        if (result.data.Image) {
          setImageSrc(`http://localhost:7000/${result.data.Image}`);
        }
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
    <div className='hr-Main-box'>
      <div className='HrImage'>
        <img src={imageSrc} alt="Profile" />
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
            <p>Role: {user.Role ? user.Role.role : 'N/A'}</p>
            <p>Status: {user.status === '1' ? 'Active' : 'Inactive'}</p>
            
            <p>In Time: {userAttendance.in_time || "Mark Attendance"}</p>
            <p>Out Time: {userAttendance.out_time || "Logout"}</p>
            <p>Today Attendance: {userAttendance.status || "Pending"}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Hrdetail;
