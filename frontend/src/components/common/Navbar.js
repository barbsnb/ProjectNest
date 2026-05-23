import React, { useContext, useState } from 'react';
import { Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LogoutButton from '../auth/LogoutButton';
import Sidebar from './/Sidebar';
import './Navbar.css';
import logo from '../../assets/images/logo.png';


const CustomNavbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <>
      {currentUser && <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />}
      <Navbar className='navbar d-flex align-items-center justify-content-between px-3' style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', zIndex: 1000 }}>
        <img 
            src={logo} 
            alt="Logo" 
            style={{ height: '40px', cursor: 'pointer' }} 
            onClick={() => navigate('/home')} 
        />

        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            {currentUser ? (
              <>
                <LogoutButton />
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className='navbar_btn'>Logowanie</button>
                <button onClick={() => navigate('/')} className='navbar_btn'>Strona główna</button>
              </>
            )}
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default CustomNavbar;
