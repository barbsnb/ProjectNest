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

<<<<<<< HEAD
    // const goToManageProjects = () =>
    // {
    //     navigate('/manage_projects');
    // };

    const goToInfoPage = () => {
        navigate('/');
    };
    
    const goToNewProjectPage = () => {
        navigate('/project');
    };

    const goToLogin = () => {
        navigate('/login');
    };

    // const goToRegister = () => {
    //     navigate('/register');
    // };


<<<<<<< HEAD
    const goToAllAppointmentsPage = () => {
        navigate('/visit_list'); 
    };

<<<<<<< HEAD
    const goToAppointmentRequestPage = () => {
        navigate('/visit_extension'); //do poprawy - powinno przechodzic do innej strony
    };

    const goToReportsPage = () => {
        navigate('/reports');
    };
=======

>>>>>>> d5a2659 (community member)
=======
>>>>>>> 21f5840 (commit)
     
    console.log(currentUser)

    return (
        <>
            <Navbar className='navbar'>
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Navbar.Text>
                        {currentUser ? (
                            <>
                                <LogoutButton />
                                {/* Warunek dla zalogowanego użytkownika */}
                
                                <>
                                    {/* <button onClick={goToManageProjects} className="mx-2 navbar_btn">Zarządzaj projektami</button> */}
                                    <button onClick={goToNewProjectPage} className="mx-2 navbar_btn">Nowy projekt</button>
                                    <button onClick={goToHomePage} className="mx-2 navbar_btn">Strona główna</button>
                                    
                                </>

                            </>
                        ) : (
                            <>
                            <button onClick={goToLogin} className='navbar_btn'>Logowanie</button>
                            {/* <button onClick={goToRegister} className='navbar_btn'>Rejestracja</button> */}
                            <button onClick={goToInfoPage} className="navbar_btn">Strona główna</button>
                            </>
                        )}      
                    </Navbar.Text>
                </Navbar.Collapse>
            </Navbar>
            
        </>
    );
=======
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
>>>>>>> db447ae (Dodany sidebar, zmiana głównej strony)
};

export default CustomNavbar;
