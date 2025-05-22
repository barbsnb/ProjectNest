import React, { useContext } from 'react';
import { Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../../contexts/AuthContext';
import LogoutButton from '../auth/LogoutButton';
import './Navbar.css'

const CustomNavbar = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate(); // Create a navigate function

    // Function to navigate to the homepage
    const goToHomePage = () => {
        navigate('/home');
    };

    const goToManageProjects = () =>
    {
        navigate('/manage_projects');
    };

    const goToInfoPage = () => {
        navigate('/');
    };
    // Function to navigate to the appointment scheduling page
    const goToNewProjectPage = () => {
        navigate('/project');
    };

    const goToLogin = () => {
        navigate('/login');
    };

    const goToRegister = () => {
        navigate('/register');
    };


     
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
                            <button onClick={goToRegister} className='navbar_btn'>Rejestracja</button>
                            <button onClick={goToInfoPage} className="navbar_btn">Strona główna</button>
                            </>
                        )}      
                    </Navbar.Text>
                </Navbar.Collapse>
            </Navbar>
            
        </>
    );
};

export default CustomNavbar;

