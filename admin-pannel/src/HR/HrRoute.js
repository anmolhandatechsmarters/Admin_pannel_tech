
import React, { lazy } from 'react'

import Detailemployee from '../Users/Detailemployee'




const ShowAllUser = React.lazy(() => import("../views/Mycomonponets/ShowALLUser/ShowAllUser"))
const Dashboard = React.lazy(() => import('../views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('../views/theme/colors/Colors'))
const Typography = React.lazy(() => import('../views/theme/typography/Typography'))
const AddUser = React.lazy(() => import('../views/Mycomonponets/Adduser/AddUser'))
// Base
const Accordion = React.lazy(() => import('../views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('../views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('../views/base/cards/Cards'))
const Carousels = React.lazy(() => import('../views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('../views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('../views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('../views/base/navs/Navs'))
const Paginations = React.lazy(() => import('../views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('../views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('../views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('../views/base/progress/Progress'))
const Spinners = React.lazy(() => import('../views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('../views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('../views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('../views/base/tooltips/Tooltips'))
const Edituser = React.lazy(() => import('../views/Mycomonponets/ShowALLUser/Edituser'))
// Buttons
const Buttons = React.lazy(() => import('../views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('../views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('../views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('../views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('../views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('../views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('../views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('../views/forms/layout/Layout'))
const Range = React.lazy(() => import('../views/forms/range/Range'))
const Select = React.lazy(() => import('../views/forms/select/Select'))
const Validation = React.lazy(() => import('../views/forms/validation/Validation'))

const Charts = React.lazy(() => import('../views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('../views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('../views/icons/flags/Flags'))
const Brands = React.lazy(() => import('../views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('../views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('../views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('../views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('../views/notifications/toasts/Toasts'))
const Widgets = React.lazy(() => import('../views/widgets/Widgets'))

const EmployeeAttendance = React.lazy(() => import('../Users/EmployeeAttendance'))

//my path


const Hradduser =React.lazy(()=>import('./view/AddHruser'))

const Hrdetail = React.lazy(() => import('./view/Hrdetail'))
const Hrattendance = React.lazy(() => import('./view/HrAttendance'))
const Hremployeedashboard = React.lazy(() => import('./view/Hremployeedashboard'))
const Hremployeeattendance = React.lazy(() => import('./view/Hremployeeattendance'))
const Hrshowemployee =React.lazy(()=>import('./view/Hrshowemployee'))
const Hrviewuser=React.lazy(()=>import("./ViewUserhr"))
const Hredituser=React.lazy(()=>import('./view/HRedituser'))
const HrDepartment=React.lazy(()=>import('./Department/HrDepartment'))
const HrAddDepartment =React.lazy(()=>import('./Department/HrAddDepartment'))
const HrDesignation =React.lazy(()=>import('./Designation/HrDesignation'))
const HrAddDesignation =React.lazy(()=>import('./Designation/HrAddDesignation'))
const HrEditProfile =React.lazy(()=>import('./HrEditProfile/HrEditProfile'))

const routes = [
  

  { path: '/edituser/:id', name: 'edituser', element: Edituser, exact: true },



  // my routes
  { path: '/hrDetail', name: 'Widgets', element: Hrdetail },
  { path: '/hrattendance', name: 'Widgets', element: Hrattendance },
  { path: '/hremployeeattendance', name: 'Widgets', element: Hremployeeattendance },
  { path: '/hremployeeattendance/:id', name: 'Widgets', element: Hremployeeattendance },
  { path: '/hrdashboard', name: 'Widgets', element:Hremployeedashboard},
  { path: '/hremployeeshow', name: 'Widgets', element:Hrshowemployee},
  { path: '/hraddemployee', name: 'Widgets', element:Hradduser},
  {path:'/hredituser/:id',name:"HrEditUser",element:Hredituser},
  { path: '/viewhruser/:id', name: 'Widgets', element:Hrviewuser},
  {path:'/hrdepartment' ,name:'HrDepartment',element:HrDepartment},
  {path:'/hradddepartment',name:'HrAddDepartment',element:HrAddDepartment},
  {path:'/hrdesignation',name:'HrDesignation',element:HrDesignation},
  {path:'/hradddesignation',name:'HrAddDesignation',element:HrAddDesignation},
  {path:'/hreditprofile/:id',name:'EditProfile',element:HrEditProfile},
]


export default routes
