import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';

const Login = () => {
  const [userAgent, setUserAgent] = useState('');
  const [ip, setIpAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();

  useEffect(() => {
    setUserAgent(navigator.userAgent);
    const fetchIpAddress = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setIpAddress(response.data.ip);
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    };
    fetchIpAddress();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post("http://localhost:7000/user/login", { email, password }, {
        params: { ip, userAgent },
        headers: { "Content-Type": "application/json" }
      });
      if (result.data.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('role', result.data.user.role);
        localStorage.setItem('id', result.data.user.id);
        navigate(result.data.user.role === 'Admin' ? "/dashboard" : result.data.user.role === 'Employee' ? "/employeedetail" : "/hrDetail");
      } else {
        setError(result.data.message);
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center login-page">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4 card-animate">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <CRow>
                      <CCol>
                        <div className='checkbox-container'>
                          <input type='checkbox' />
                          <span>Remember me</span>
                        </div>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit" disabled={loading}>
                          {loading ? 'Logging in...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <Link to="/forgetpassword">
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              {windowWidth >= 786 && (
                <CCard className="text-white bg-primary py-5 signup-card">
                  <CCardBody className="text-center">
                    <h2>Attendance Management System</h2>
                    <p>Welcome to the Attendance Management System. It is used to handle the Attendance for the Employees.</p>
                  </CCardBody>
                </CCard>
              )}
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
    </div>
  );
};

export default Login;
