// components/common/Layout.js
import React, { useContext } from "react";
import CustomNavbar from "./Navbar";
import Sidebar from "./Sidebar";
import { AuthContext } from "../../contexts/AuthContext";

const Layout = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <>
      <CustomNavbar />
      <div style={{ display: "flex" }}>
        {currentUser && <Sidebar />}
        <main
          style={{
            marginTop: "60px",
            padding: "20px",
            flex: 1,
            marginLeft: currentUser ? "200px" : 0,
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
