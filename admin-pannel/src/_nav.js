import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUserPlus,
  cilUser,


} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
const role=localStorage.getItem("role")

const adminNav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },


  {
    component: CNavItem,
    name: 'Employees',
    to: '/alluser',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Department',
    to: '/alldepartment',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Designation',
    to: '/alldesignation',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Attendance',
    to: '/attendance',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Log',
    to: '/adminlog',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
]

const userNav=[

    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/employeedetail',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      
    },

    {
      component: CNavItem,
      name: 'Attendance',
      to: '/employeeAttendance',
      icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
    },
]

const hrNav=[
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/hrDetail',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'My Attendance',
    to: '/hrAttendance',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Department',
    to: '/hrdepartment',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Designation',
    to: '/hrdesignation',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Employee',
    to: '/hremployeeshow',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Employee Attendance',
    to: '/hremployeeattendance',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
 

]


const getNavigation = (role) => {
  switch (role) {
    case 'Admin':
      return adminNav
    case 'Employee':
      return userNav
    case "HR":
      return hrNav
    default:
      return []
  }
}

export default getNavigation
