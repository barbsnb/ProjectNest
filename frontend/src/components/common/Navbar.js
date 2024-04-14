import React, { useContext, useState } from 'react';
import { Navbar, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../../contexts/AuthContext';
import LogoutButton from '../auth/LogoutButton';

const CustomNavbar = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate(); // Create a navigate function
    const [showLogin, setShowLogin] = useState(true);

    // Function to navigate to the homepage
    const goToHomePage = () => {
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
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand onClick={goToHomePage}>SystemPlanowaniaWizyt</Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Navbar.Text>
                        {currentUser ? (
                            <>
                                <Button variant="outline-light" onClick={goToHomePage} className="mx-2">Homepage</Button>
                                <Button variant="outline-light" onClick={goToAppointmentPage} className="mx-2">Umów wizytę</Button>
                                <LogoutButton />
                            </>
                        ) : (
                            <Button variant="light" onClick={handleLoginOrRegister}>
                                {showLogin ? 'Logowanie' : 'Rejestracja'}
                            </Button>
                        )}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;

