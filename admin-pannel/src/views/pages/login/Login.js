import React, { useState ,useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import "./Login.css"
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

  useEffect(() => {
    const ua = navigator.userAgent;
    setUserAgent(ua);
  }, []);


  useEffect(() => {
    const fetchIpAddress = async () => {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setIpAddress(response.data.ip);
        } catch (error) {
            console.error('Error fetching IP address:', error);
        }
    };

    fetchIpAddress();
}, []);


const [ip, setIpAddress] = useState('');

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Simple client-side validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true); // Set loading state to true

    try {
      const result = await axios.post("http://localhost:7000/user/login", {
        email,
        password
      },
     
      {
        params:{ip,userAgent},
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (result.data.success) {
        localStorage.setItem('token', result.data.token);  // Store JWT token
        localStorage.setItem('role', result.data.user.role);
        localStorage.setItem('id', result.data.user.id)
        switch (result.data.user.role) {
          case 'Admin':
            navigate("/dashboard");
            break;
          case 'Employee':
            navigate("/employeedetail");
            break;
          case 'HR':
            navigate("/hrDetail");
            break;
          default:
            navigate("/404");
            break;
        }
      } else {
        setError(result.data.message);
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
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
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email" // Ensures proper email input type
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
                        name='password'
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
              <CCard className="text-white bg-primary py-5 signup-card">
                <CCardBody className="text-center">
                  <div>
                    <h2>Attendance Managment System</h2>
                    <p>
                      Welcome to the Attendance Management System. It Used the handle the Attendance for the Employees
                    </p>
                    <Link to="/register">

                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
