import React, { useState } from 'react';
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
  const email = location.state?.email; // Retrieve email from location state

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess(''); // Clear success message if passwords don't match
      return;
    }

    try {
      const result = await axios.post('http://localhost:7000/user/updatepassword', {
        email,
        newPassword
      });

      if (result.data.success) {
        setSuccess('Password updated successfully.');
        setError(''); // Clear error message on success
        setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds to allow user to read the message
      } else {
        setError(result.data.message);
        setSuccess(''); // Clear success message if there's an error
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('An error occurred. Please try again.');
      setSuccess(''); // Clear success message if there's an error
    }
  };

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
