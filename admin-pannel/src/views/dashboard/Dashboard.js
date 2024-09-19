import React, { useEffect, useState } from 'react';
import './Dashobard.css';
import axios from 'axios';
import ActiveUser from '../../assets/myimages/check.png';
import TotalUser from '../../assets/myimages/group.png';
import InactiveUser from '../../assets/myimages/unfriend.png';

const AdminDashboard = () => {
  const [alluser, setalluser] = useState(0);
  const [activeuser, setactiveuser] = useState(0);
  const [inactiveuser, setinactiveuser] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const totalUsers = await axios.get("http://localhost:7000/user/totaluser");
        setalluser(totalUsers.data);
        const activeUsers = await axios.get("http://localhost:7000/user/allactiveuser");
        setactiveuser(activeUsers.data);
        const inactiveUsers = await axios.get("http://localhost:7000/user/allinactiveuser");
        setinactiveuser(inactiveUsers.data);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-card-content">
          <div className="dashboard-user-number">
            <img src={TotalUser} alt="Total Users" className="dashboard-image" />
            {alluser}
          </div>
          <div className="dashboard-label">Total number of users</div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-content">
          <div className="dashboard-user-number">
            <img src={ActiveUser} alt="Active Users" className="dashboard-image" />
            {activeuser}
          </div>
          <div className="dashboard-label">Total active users</div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-content">
          <div className="dashboard-user-number">
            <img src={InactiveUser} alt="Inactive Users" className="dashboard-image" />
            {inactiveuser}
          </div>
          <div className="dashboard-label">Total inactive users</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
