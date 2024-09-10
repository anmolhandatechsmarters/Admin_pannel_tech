import React, { useState, useEffect, useRef } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewUser.css'; // Import CSS for styling
import { FaCamera } from 'react-icons/fa';

function ViewUser() {
  const Navigate=useNavigate()
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [user, setUser] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeSection, setActiveSection] = useState('user'); // Track active section
  const { id } = useParams();
  const fileInputRef = useRef(null); // Ref for file input

  useEffect(() => {
    async function getUser() {
      try {
        const result = await axios.get(`http://localhost:7000/admin/viewuser/${id}`);
        console.log(result.data);
        setUser(result.data);
    
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    }
    const fetchAttendanceRecords = async () => {
      try {
        
        const response = await axios.get(`http://localhost:7000/admin/viewuserattendence/${id}`);
        console.log(response.data)
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error('Error fetching attendance records', error);
      }
    };
fetchAttendanceRecords()
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
      fetchImages();
    } catch (error) {
      console.error('Error uploading image', error);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      handleImageUpload();
    }
  }, [selectedImage]);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`http://localhost:7000/admin/images/${id}`);
      setImageList(response.data);
    } catch (error) {
      console.error('Error fetching images', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [id]);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const profileImageUrl = user.Image
    ? `http://localhost:7000/${user.Image}`
    : 'http://localhost:7000/uploads/1.jpg'; // Use a default image URL


    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
    ];
    const status = ['Present', 'Absent', 'Halfday'];
  
    const years = ["2024","2025"]
    

const handleattendanceuser=(userid)=>{
  Navigate(`/attendance/${userid}`)
}


  
  return (
    <div className="main-container-view-user">
      <div className="sidebar">
        <div className="profile">
          <div className="img">
            <img src={profileImageUrl} alt="Profile" />
            {user.Image && (
              <FaCamera className="camera-icon" onClick={handleCameraClick} />
            )}
            <input
              type="file"
              onChange={handleImageChange}
              ref={fileInputRef} // Attach ref to file input
              style={{ display: 'none' }} // Hide the file input
            />
          </div>
          <p>{user.emp_id}</p>
        </div>
        <div className="menu">
          <button
            onClick={() => setActiveSection('user')}
            className={activeSection === 'user' ? 'active' : ''}
          >
            User Info
          </button>
          <button
            onClick={()=>handleattendanceuser(user.user_id)}
          >
            Attendance
          </button>
        </div>
      </div>
      <div className="content">
        {activeSection === 'user' && (
          <div className="user-info">
            <h2 className='text-center'>User Information</h2>
            <div className='view-user-user-info'>
              <div>
                <p><span className='fw-bold'>Employee ID</span>: {user.emp_id}</p>
                <p><span className='fw-bold'>First Name</span> : {user.first_name}</p>
                <p><span className='fw-bold'>Last Name </span> : {user.last_name}</p>
                <p><span className='fw-bold'>Email ID </span>  : {user.email}</p>
                <p><span className='fw-bold'>Role    </span>   : {user.role}</p>
                <p><span className='fw-bold'>Create by    </span>   : {user.created_by}</p>
                <p><span className='fw-bold'>Status    </span>   : {user.status}</p>
              </div>
              <div>
                <p><span className='fw-bold'>Country  </span>  : {user.country}</p>
                <p><span className='fw-bold'>State   </span>   : {user.states}</p>
                <p><span className='fw-bold'>City    </span>   : {user.city}</p>
                <p><span className='fw-bold'>IP   </span>      : {user.ip}</p>
                <p><span className='fw-bold'>Last Login</span> : {user.last_login}</p>
                <p><span className='fw-bold'>Create on</span> : {user.created_on}</p>
                <p><span className='fw-bold'>Update on</span> : {user.updated_on}</p>
              </div>
            </div>
          </div>
        )}



        
      </div>
    </div>


  );
}

export default ViewUser;
