import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import client from '../../axiosClient';
import '../common/Navbar.css'

const LogoutButton = () => {
  const { setCurrentUser } = useContext(AuthContext);

  const handleLogout = () => {
    client.post("/api/logout")
      .then(() => {
        setCurrentUser(null);  // Assuming setting to null logs the user out in your context
        window.location.href = '/';
        alert("You have been logged out successfully.");
      })
      .catch(err => {
        console.error("Logout failed: ", err);
        alert("Logout failed. Please try again.");
      });
  };

  return (
    <Button id="navbar_btn" onClick={handleLogout} variant="light">Wyloguj</Button>
  );
};

export default LogoutButton;