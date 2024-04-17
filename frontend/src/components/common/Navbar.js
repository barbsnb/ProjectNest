import React, { useContext, useState } from 'react';
import { Navbar, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../../contexts/AuthContext';
import LogoutButton from '../auth/LogoutButton';
import PWLogo from '../../assets/images/znak_pw.png'
import './Navbar.css'

const CustomNavbar = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate(); // Create a navigate function
    const [showLogin, setShowLogin] = useState(true);

    // Function to navigate to the homepage
    const goToHomePage = () => {
        navigate('/home');
    };

    const goToInfoPage = () => {
        navigate('/');
    };
    // Function to navigate to the appointment scheduling page
    const goToAppointmentPage = () => {
        navigate('/schedule');
    };

    const handleLoginOrRegister = () => {
        // Navigate based on the state of showLogin
        navigate(showLogin ? '/login' : '/register');
        setShowLogin(!showLogin); // Toggle the state to switch between login and register
    };

    return (
        <Container className = "form_container">
            <Navbar bg="dark" variant="dark">
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Navbar.Text>
                        {currentUser ? (
                            <>
                                <Button id="navbar_btn" variant="outline-light" onClick={goToHomePage} className="mx-2">Strona główna</Button>
                                <Button id="navbar_btn" variant="outline-light" onClick={goToAppointmentPage} className="mx-2">Umów wizytę</Button>
                                <LogoutButton />
                            </>
                        ) : (
                            <>
                            <Button id="navbar_btn" variant="light" onClick={handleLoginOrRegister}>
                                {showLogin ? 'Logowanie' : 'Rejestracja'}
                            </Button>
                            <Button id="navbar_btn" variant="outline-light" onClick={goToInfoPage} className="mx-2">Strona główna</Button>
                            </>
                        )}      
                    </Navbar.Text>
                </Navbar.Collapse>
            </Navbar>
            <div id="header-position">
                <div id="image_logo" className="container">
                    <div className="image_logo-middle">
                        <img src={PWLogo} alt="Politechnika Warszawska Logo" />
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default CustomNavbar;

