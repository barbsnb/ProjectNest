import React, { useContext } from "react";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/images/logo.png";
import { AuthContext } from "../../contexts/AuthContext";
import LogoutButton from "../auth/LogoutButton";
import "./Navbar.css";

const CustomNavbar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <button className="topbar-brand" type="button" onClick={() => navigate(currentUser ? "/home" : "/")}>
        <img src={logo} alt="PRAETOR" />
        <span>PRAETOR</span>
      </button>

      {currentUser ? (
        <div className="topbar-actions">
          <div className="topbar-search">
            <Search size={16} />
            <span>Search audits</span>
          </div>
          <button className="topbar-icon-button" type="button" aria-label="Notifications">
            <Bell size={17} />
          </button>
          <LogoutButton />
        </div>
      ) : (
        <div className="topbar-actions">
          <button onClick={() => navigate("/login")} className="navbar_btn" type="button">
            Logowanie
          </button>
          <button onClick={() => navigate("/")} className="navbar_btn" type="button">
            Strona glowna
          </button>
        </div>
      )}
    </header>
  );
};

export default CustomNavbar;
