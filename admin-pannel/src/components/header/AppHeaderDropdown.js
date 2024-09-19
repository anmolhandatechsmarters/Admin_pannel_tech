import React from 'react'
import axios from 'axios'
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import avatar8 from '../../assets/images/avatars/1.jpg'
import { useNavigate } from 'react-router-dom'


const AppHeaderDropdown = () => {
  const navigate = useNavigate();

  const id = localStorage.getItem('id');

  const handleLogout = async () => {
    try {
      await axios.put(`http://localhost:7000/user/logout/${id}`, {}, {
        headers: {
          "Content-Type": "application/json"
        }
      });


      localStorage.removeItem('id');
      localStorage.removeItem('token');
      localStorage.removeItem('role');


      navigate("/login");
    } catch (error) {
      console.error('Logout failed:', error);

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
