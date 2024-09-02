import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Confirmpassword.css';

const Confirmpassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(true); // Added state for token validity check
  const email = location.state?.email; 

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('forgetpasswordtoken');
      const forgetPasswordFlag = localStorage.getItem('forgetpassword');

      if (!token || forgetPasswordFlag !== 'true') {
        navigate('/login'); 
        return;
      }

      try {
        const response = await axios.get('http://localhost:7000/user/verifyforgetpasswordtoken', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.data.success) {
          localStorage.removeItem('forgetpasswordtoken');
          localStorage.removeItem('forgetpassword');
          navigate('/login');
        } else {
          setIsTokenValid(true);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('forgetpasswordtoken');
        localStorage.removeItem('forgetpassword');
        navigate('/login');
      }
    };

    verifyToken();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }

    if (!isTokenValid) {
      setError('Invalid or expired token.');
      setSuccess('');
      return;
    }

    try {
      const token = localStorage.getItem('forgetpasswordtoken');
      const result = await axios.post('http://localhost:7000/user/updatepassword', {
        email,
        newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (result.data.success) {
        setSuccess('Password updated successfully.');
        setError('');
        setTimeout(() => {
          localStorage.removeItem('forgetpassword');
          localStorage.removeItem('forgetpasswordtoken');
          navigate('/login');
        }, 2000);
      } else {
        setError(result.data.message);
        setSuccess('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('An error occurred. Please try again.');
      setSuccess('');
    }
  };

  if (!isTokenValid) {
    return <div>Loading...</div>; // Optional loading state
  }

  return (
    <div className="confirmpassword-container">
      <div className="confirmpassword-card">
        <h2>Update Password</h2>
        {error && <div className="notification error">{error}</div>}
        {success && <div className="notification success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default Confirmpassword;
