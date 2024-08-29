import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Forgetpassword.css';

const Forgetpassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [notification, setNotification] = useState('');
  const [notificationColor, setNotificationColor] = useState(''); // New state for notification color
  const navigate = useNavigate();

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setNotification('Please wait, sending email...'); // Update notification
    setNotificationColor('blue'); // Set color for waiting message
    try {
      const result = await axios.post('http://localhost:7000/user/forgetpassword', { email });
      if (result.data.success) {
        setStep('otp');
        setNotification('Check your email and enter the OTP.');
        setNotificationColor('green'); // Set color for OTP entry message
      } else {
        setNotification(result.data.message);
        setNotificationColor('red'); // Set color for error message
      }
    } catch (error) {
      setNotification('An error occurred. Please try again.');
      setNotificationColor('red'); // Set color for error message
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setNotification('Verifying OTP...'); // Update notification
    setNotificationColor('blue'); // Set color for verifying message
    try {
      const result = await axios.post('http://localhost:7000/user/verifyotp', { email, otp });
      if (result.data.success) {
        navigate('/confirmforgetpassword', { state: { email } });
      } else {
        setNotification('Your OTP is not valid.');
        setNotificationColor('red'); // Set color for error message
      }
    } catch (error) {
      setNotification('An error occurred. Please try again.');
      setNotificationColor('red'); // Set color for error message
    }
  };

  return (
    <div className="forgetpassword-container">
      <div className="forgetpassword-card">
        <h2 className="forgetpassword-title">{step === 'email' ? 'Forgot Password' : 'Verify OTP'}</h2>
        {notification && (
          <div className={`forgetpassword-notification ${notificationColor}`}>
            {notification}
          </div>
        )}
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send</button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <input
              type="text"
              placeholder="Enter your OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">Verify OTP</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Forgetpassword;
