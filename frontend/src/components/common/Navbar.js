import React, { useContext } from 'react';
import { Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../../contexts/AuthContext';
import LogoutButton from '../auth/LogoutButton';
import PWLogo from '../../assets/images/znak_pw.png'
import './Navbar.css'

const CustomNavbar = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate(); // Create a navigate function

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

    const goToLogin = () => {
        navigate('/login');
    };

    const goToRegister = () => {
        navigate('/register');
    };

    const goToAppointmentExtentionPage = () => {
        navigate('/visit_extension'); //do poprawy - powinno przechodzic do innej strony
    };

    const goToAllAppointmentsPage = () => {
        navigate('/visit_list'); 
    };

    const goToAppointmentRequestPage = () => {
        navigate('/visit_extension'); //do poprawy - powinno przechodzic do innej strony
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
                                {currentUser.user.is_receptionist === false && currentUser.user.is_community_member === false && (
                                <>
                                    <button onClick={goToAppointmentPage} className="mx-2 navbar_btn">Umów wizytę</button>
                                    <button onClick={goToHomePage} className="mx-2 navbar_btn">Strona główna</button>
                                    
                                </>
                                )}

                                {/* Warunek dla recepcjonisty */}
                                {currentUser.user.is_receptionist === true && (
                                    <>
                                        <button onClick={goToAllAppointmentsPage} className="mx-2 navbar_btn">Strona główna</button>
                                    </>
                                )}

                                {/* Warunek dla członka społeczności */}
                                {currentUser.user.is_community_member === true && (
                                    <>
                                        <button onClick={goToAppointmentPage} className="mx-2 navbar_btn">Umów wizytę</button>
                                        <button onClick={goToHomePage} className="mx-2 navbar_btn">Strona główna</button>
                                        <button onClick={goToAppointmentExtentionPage} className="mx-2 navbar_btn">Przedłużenie wizyty</button>
                                        <button onClick={goToAppointmentRequestPage} className="mx-2 navbar_btn">Wnioski</button>
                                        <button onClick={goToAllAppointmentsPage} className="mx-2 navbar_btn">Lista wszystkich wizyt</button>
                                    </>
                                )}

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
            <div id="header-position">
                <div id="image_logo" className="container">
                    <div className="image_logo-middle">
                        <img src={PWLogo} alt="Politechnika Warszawska Logo" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomNavbar;

