import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewUser.css'; // Import CSS for styling
import { FaCamera } from 'react-icons/fa';
import defaultImage from "../../../assets/images/avatars/1.jpg"
function ViewUser() {
  const Navigate = useNavigate()
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
        console.log(result.data.user);
        setUser(result.data.user);

      } catch (error) {
        console.error('Error fetching user data', error);
      }
    }
    //     const fetchAttendanceRecords = async () => {
    //       try {

    //         const response = await axios.get(`http://localhost:7000/admin/viewuserattendence/${id}`);
    //         console.log(response.data)
    //         setAttendanceRecords(response.data);
    //       } catch (error) {
    //         console.error('Error fetching attendance records', error);
    //       }
    //     };
    // fetchAttendanceRecords()
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

  const profileImageUrl = `http://localhost:7000/${user.Image}`




  const handleattendanceuser = (userid) => {
    Navigate(`/attendance/${userid}`)
  }

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
            onClick={() => handleattendanceuser(user.emp_id)}
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
                <p><span className='fw-bold'>Role    </span>   : {user.Role ? user.Role.role : 'N/A'}</p>
                <p><span className='fw-bold'>Create by    </span>   : {user.created_by}</p>
                <p><span className='fw-bold'>Status    </span>   : {user.status === 1 ? "InActive" : "Active"}</p>
              </div>
              <div>
                <p><span className='fw-bold'>Country  </span>  : {user.Country ? user.Country.name : 'N/A'}</p>
                <p><span className='fw-bold'>State   </span>   : {user.State ? user.State.name : 'N/A'}</p>
                <p><span className='fw-bold'>City    </span>   : {user.City ? user.City.name : 'N/A'}</p>
                <p><span className='fw-bold'>IP   </span>      : {user.ip}</p>
                <p><span className='fw-bold'>Last Login</span> : {formatDate(user.last_login)}</p>
                <p><span className='fw-bold'>Create on</span> : {formatDate(user.created_on)}</p>
                <p><span className='fw-bold'>Update on</span> : {formatDate(user.updated_on)}</p>
              </div>
            </div>
          </div>
        )}




      </div>
    </div>


  );
}

export default ViewUser;
