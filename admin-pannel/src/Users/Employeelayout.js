import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const UserLayout = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          
            
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default UserLayout