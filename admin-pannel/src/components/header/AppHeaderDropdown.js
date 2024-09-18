import React from 'react'
import axios from 'axios'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import avatar8 from '../../assets/images/avatars/1.jpg'
import { useNavigate } from 'react-router-dom' // Import useNavigate


const AppHeaderDropdown = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const id = localStorage.getItem('id');

  const handleLogout = async () => {
    try {
      await axios.put(`http://localhost:7000/user/logout/${id}`, {}, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      // Clear localStorage or other cleanup actions
      localStorage.removeItem('id');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error('Logout failed:', error);
      // You can show an error message to the user here if needed
    }
  };
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem>
          <CIcon icon={cilLockLocked} className="me-2" />
          <span onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Lock Account
          </span>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
