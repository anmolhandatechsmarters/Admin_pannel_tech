import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// ProtectedRoute component to check user role before rendering a route
const AdminProtectedRoute = ({ component: Component, ...rest }) => {
  const role = localStorage.getItem('role'); // Get role from localStorage
  
  return (
    <Route
      {...rest}
      render={(props) =>
        role === 'admin' ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" /> // Redirect to login or any other page
        )
      }
    />
  );
};

export default AdminProtectedRoute;
