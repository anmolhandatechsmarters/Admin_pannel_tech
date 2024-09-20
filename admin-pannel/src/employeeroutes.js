
import React from 'react'

import Detailemployee from './Users/Detailemployee'

import EmployeeProfileEdit from "./Users/EmployeeProfileEdit/EmployeeProfileEdit"


const Edituser=React.lazy(()=>import('./views/Mycomonponets/ShowALLUser/Edituser'))



const EmployeeAttendance =React.lazy(()=>import('./Users/EmployeeAttendance'))

const routes = [
  

  { path: '/edituser/:id', name: 'edituser', element: Edituser, exact: true },

  
{ path: '/employeedetail', name: 'Detail', element: Detailemployee },
{path:'/employeeAttendance' ,name:'EmployeeAttendance',element:EmployeeAttendance},
{path:'/empeditprofile/:id',name:"Edit Profile",element:EmployeeProfileEdit}
]


export default routes
