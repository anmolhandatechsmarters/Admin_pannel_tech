// UnauthorizedPage.jsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
 
  const navigate = useNavigate();




  return (
    <div>
      <button onClick={() => navigate(-1)}>go back</button>
    </div>
  );
};

export default UnauthorizedPage;



