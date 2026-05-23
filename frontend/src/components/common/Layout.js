import React, { useContext } from "react";
import CustomNavbar from "./Navbar";
import Sidebar from "./Sidebar";
import { AuthContext } from "../../contexts/AuthContext";
import "./Layout.css";

const Layout = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="app-shell">
      <CustomNavbar />
      <div className="app-frame">
        {currentUser && <Sidebar />}
        <main className={currentUser ? "app-content with-sidebar" : "app-content"}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
