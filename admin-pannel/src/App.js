import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'


import Employee from './Mytemppage/Employee';

import Admin from './Mytemppage/Admin';
import PrivateRoute from './Mytemppage/Privaterouting';
import UnauthorizedPage from './Mytemppage/Unauthorized'
import Forgetpassword from './views/notifications/ForgetPasswordlogin/Forgetpassword'
import Confirmpassword from './views/notifications/ForgetPasswordlogin/Confirmpassword'
import DefaultLayout from "./layout/DefaultLayout"
import Hrmarkattandence from './HR/Hrmarkattandence'
// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

import ErrorBoundary from './Mytemppage/ErrorBoundary'
import routes from "./routes"



const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          <Route exact path="/" name="Login Page" element={<Login />} />
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/forgetpassword" name="Login Page" element={<Forgetpassword/>} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" name="default" element={<DefaultLayout />} />
<Route path="/user/employee" element={<PrivateRoute element={Employee} allowedRoles={['Employee', 'HR', 'Admin']} />} />

{/* hr routing */}

           <Route path="/user/hr" element={<PrivateRoute element={Hrmarkattandence} allowedRoles={['HR', 'Admin']} />} />     
           
{/* hr routing end */}      
           <Route path="/user/admin" element={<PrivateRoute element={Admin} allowedRoles={['Admin']} />} />

{/* Admin page routing */}



<Route path='/unauthorized' element={<UnauthorizedPage/>}/>
<Route exact path="/Confirmforgetpassword" name="Page 500" element={<Confirmpassword/>} />

        </Routes>
      
      </Suspense>
      </BrowserRouter>

  )
}

export default App
