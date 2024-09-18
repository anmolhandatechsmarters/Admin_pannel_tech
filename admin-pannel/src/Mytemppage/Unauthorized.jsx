// UnauthorizedPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Css/unauthorized.css'; // Import the CSS file

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  function goback() {
    if (role === "Admin") {
      navigate("/user/admin");
    } else if (role === "Employee") {
      navigate("/user/employee");
    } else if (role === "HR") {
      navigate("/user/hr");
    }
  }

  return (
    <div className="container">
      {/* <h1>Unauthorized</h1>
      <p>You are accessing an unauthorized page</p>
      <p>Please go back</p>
      <button onClick={goback}>Go Back</button> */}
    </div>
  );
};

export default UnauthorizedPage;
