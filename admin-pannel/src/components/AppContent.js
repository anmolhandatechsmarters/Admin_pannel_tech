import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CContainer, CSpinner } from '@coreui/react';
import PrivateRoute from '../Mytemppage/Privaterouting';
import routes from '../routes';
import employeeroutes from '../employeeroutes';
import HrRoute from "../HR/HrRoute";

const AppContent = () => {
  const adminRoutes = routes.map((route, idx) => {
    return (
      route.element && (
        <Route
          key={`admin-${idx}`}
          path={route.path}
          exact={route.exact}
          name={route.name}
          element={<PrivateRoute element={route.element} allowedRoles={['Admin']} />}
        />
      )
    );
  });

 
  const hrRoutes = HrRoute.map((route, idx) => {
    return (
      route.element && (
        <Route
          key={`Hr-${idx}`}
          path={route.path}
          exact={route.exact}
          name={route.name}
          element={<PrivateRoute element={route.element} allowedRoles={['HR']} />}
        />
      )
    );
  });

  const employeeRoutes = employeeroutes.map((route, idx) => {
    return (
      route.element && (
        <Route
          key={`employee-${idx}`}
          path={route.path}
          exact={route.exact}
          name={route.name}
          element={<PrivateRoute element={route.element} allowedRoles={['Employee']} />}
        />
      )
    );
  });

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {adminRoutes}
          {hrRoutes}
          {employeeRoutes}
        </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);
