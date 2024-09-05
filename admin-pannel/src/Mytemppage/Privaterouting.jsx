// Privaterouting.jsx

import React from 'react';
import { Navigate} from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ element: Component, allowedRoles, ...rest }) => {
  const userRole = localStorage.getItem("role");
const token=localStorage.getItem("token")

  if (!token||!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized"  />
  }

  // Render the component if authenticated and has the required role
  return <Component {...rest} />;
};

PrivateRoute.propTypes = {
  element: PropTypes.elementType.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default PrivateRoute;
