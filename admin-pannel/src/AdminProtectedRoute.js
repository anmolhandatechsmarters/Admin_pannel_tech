// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ allowedRoles }) => {
  const user = useSelector(state => state.user); // Adjust based on your state structure
  const isAuthenticated = user && user.isAuthenticated;
  const hasRole = allowedRoles.includes(user.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
