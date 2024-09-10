import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import PrivateRoute from '../Mytemppage/Privaterouting' // Adjust the path as necessary
import routes from '../routes'
import employeeroutes from '../employeeroutes'

const AppContent = () => {
  // Generate routes for Admin
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
    )
  })

  // Generate routes for Employee
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
    )
  })

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {adminRoutes}
          {employeeRoutes}
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
