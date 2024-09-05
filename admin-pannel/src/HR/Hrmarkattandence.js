import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hrmarkattandence = () => {
  const navigate = useNavigate(); // Use the useNavigate hook to programmatically navigate
  const id = localStorage.getItem('id');

  const handleLogout = async () => {
    try {
      await axios.put(`http://localhost:7000/user/logout/${id}`, {}, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      // Clear localStorage or other cleanup actions
      localStorage.removeItem('id');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error('Logout failed:', error);
      // You can show an error message to the user here if needed
    }
  };

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
};

export default Hrmarkattandence;
