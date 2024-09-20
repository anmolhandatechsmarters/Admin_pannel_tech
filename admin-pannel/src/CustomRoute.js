import React from 'react';
import { Navigate } from 'react-router-dom';

const CustomRoute = ({ element: Element, validateId, ...rest }) => {
  const { id } = rest.params;

  if (validateId(id)) {
    return <Element {...rest} />;
  } else {
    return <Navigate to="/404" />;
  }
};

export default CustomRoute;
