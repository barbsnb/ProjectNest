import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../../axiosClient";
import { AuthContext } from "../../contexts/AuthContext";
import "../common/Navbar.css";

const LogoutButton = () => {
  const { setCurrentUser } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggingOut(true);
    setError("");

    client
      .post("/api/logout")
      .then(() => {
        window.localStorage.removeItem("praetorAuthToken");
        setCurrentUser(null);
        navigate("/");
      })
      .catch((err) => {
        if ([401, 403].includes(err.response?.status)) {
          window.localStorage.removeItem("praetorAuthToken");
          setCurrentUser(null);
          navigate("/");
          return;
        }
        console.error("Wylogowanie nie powiodło się:", err);
        setError("Nie udało się wylogować.");
      })
      .finally(() => {
        setIsLoggingOut(false);
      });
  };

  return (
    <span className="logout-control">
      <button className="navbar_btn" onClick={handleLogout} disabled={isLoggingOut} type="button">
        {isLoggingOut ? "Wylogowywanie..." : "Wyloguj"}
      </button>
      {error && <span className="logout-error">{error}</span>}
    </span>
  );
};

export default LogoutButton;
