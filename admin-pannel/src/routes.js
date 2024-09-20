
import React, { lazy } from 'react'
import Home from './layout/Home'
import Attendance from './views/Mycomonponets/Attendance/Attendance'
import ViewUser from './views/Mycomonponets/ViewUser/ViewUser'
import Department from './views/Mycomonponets/Department/Department'
import Designation from './views/Mycomonponets/Designation/Designation'
import CustomRoute from './CustomRoute'

import EditProfile from './views/Mycomonponets/AdminEditProfile/AdminEditProfile'
const ShowAllUser =React.lazy(()=>import("./views/Mycomonponets/ShowALLUser/ShowAllUser"))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))

const AddUser =React.lazy(()=>import('./views/Mycomonponets/Adduser/AddUser'))
// Base

const Edituser=React.lazy(()=>import('./views/Mycomonponets/ShowALLUser/Edituser'))
// Buttons
const log=React.lazy(()=>import('./views/Mycomonponets/Log/log'))
const DepartmentAdd =React.lazy(()=>import('./views/Mycomonponets/Department/Departmentadd'))


const DesignationAdd =React.lazy(()=>import('./views/Mycomonponets/Designation/Designationadd'))

const validateId = (id) => {
  // Check if id is a non-negative integer or starts with "emp" followed by a number
  const isValidId = /^[0-9]+$/.test(id) || /^emp[1-9]\d*$/.test(id);
  return isValidId;
};

const routes = [
  { path: '/',  name: 'Home' ,element:Home},
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  
  { path: '/edituser/:id', name: 'edituser', element: Edituser, exact: true },
  // { path: '/adduser', name: 'adduser', element:Addser, exact: true },
  {path:"/adduser" , name:"AddUser" , element:AddUser, exact:true},
  {path:"/alluser" , name:"AllUser" , element:ShowAllUser, exact:true},
  
// my routes
{ path: '/attendance', name: 'Attendance', element:Attendance},
{ path: '/attendance/:id', name: 'Attendance', element:Attendance},
{ path: '/viewuser/:id', name: 'ViewUser', element:ViewUser},
{ path: '/adminlog', name: 'ViewUser', element:log},
{path:'/alldepartment',name:"Department",element:Department},
{path:'/adddepartment',name:"Department",element:DepartmentAdd},
{path:'/adddesignation', name:"Designation",element:DesignationAdd},
{path:'/alldesignation',name:"Designation",element:Designation},
{path:'/editprofile/:id',name:'Editprofile',element:EditProfile}
]


export default routes
