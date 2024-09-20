import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';

import Admin from './Mytemppage/Admin';
import PrivateRoute from './Mytemppage/Privaterouting';
import UnauthorizedPage from './Mytemppage/Unauthorized';
import Forgetpassword from './views/notifications/ForgetPasswordlogin/Forgetpassword';
import Confirmpassword from './views/notifications/ForgetPasswordlogin/Confirmpassword';
import DefaultLayout from "./layout/DefaultLayout";
import HRLayout from './HR/HRLayout';

// Lazy load pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const EmployeeLayout = React.lazy(() => import('./Users/Employeelayout'));

const App = () => {
  const { id } = useParams(); // Get ID from URL params
  const [idExists, setIdExists] = useState(true); // Track if ID exists
  const [loading, setLoading] = useState(true); // Track loading state

  const routes = [
    '/', '/login', '/forgetpassword', '/register', '/user/employee', 
    '/user/hr', '/user/admin', '/dashboard', '/Confirmforgetpassword', 
    '/edituser/:id', '/adduser', '/alluser', '/attendance', 
    '/attendance/:id', '/viewuser/:id', '/adminlog', 
    '/alldepartment', '/adddepartment', '/adddesignation', 
    '/alldepartment', '/editprofile/:id', '/employeedetail', 
    '/employeeAttendance', '/hrDetail', '/hrattendance', 
    '/hremployeeattendance', '/hremployeeattendance/:id', 
    '/hrdashboard', '/hremployeeshow', '/hraddemployee', 
    '/hredituser/:id', '/viewhruser/:id', '/hrdepartment', 
    '/hradddepartment', '/hrdesignation', '/hradddesignation','/hrAttendance'
  ];

  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)?.[0];

    if (theme) {
      setColorMode(theme);
    } else if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  }, [isColorModeSet, setColorMode, storedTheme]);

  useEffect(() => {
    const checkIdExists = async () => {
      if (id) {
        try {
          // Replace with your actual API endpoint
          const response = await fetch(`http://localhost:7000/user/checkid/${id}`);
          const data = await response.json();
          setIdExists(data.exists); // Assuming your API returns { exists: true/false }
        } catch (error) {
          console.error('Error checking ID:', error);
          setIdExists(false);
        }
      }
      setLoading(false);
    };

    checkIdExists();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {routes.includes(window.location.pathname) ? (
            <Route path="*" name="default" element={<DefaultLayout />} />
          ) : (
            <Route path="*" name="Page 404" element={<Page404 />} />
          )}

          <Route path="/" name="Login Page" element={<Login />} />
          <Route path="/login" name="Login Page" element={<Login />} />
          <Route path="/forgetpassword" name="Forget Password" element={<Forgetpassword />} />
          <Route path="/register" name="Register Page" element={<Register />} />
          <Route path="/500" name="Page 500" element={<Page500 />} />
          <Route path="/user/employee" element={<PrivateRoute element={EmployeeLayout} allowedRoles={['Employee']} />} />
          <Route path="/user/hr" element={<PrivateRoute element={HRLayout} allowedRoles={['HR']} />} />
          <Route path="/user/admin" element={<PrivateRoute element={Admin} allowedRoles={['Admin']} />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/Confirmforgetpassword" name="Confirm Password" element={<Confirmpassword />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
