// components/common/BaseLayout.js
import React from "react";
import CustomNavbar from "./Navbar";

const BaseLayout = ({ children }) => {
  return (
    <>
      <CustomNavbar />
      <main style={{ marginTop: "60px", padding: "20px" }}>
        {children}
      </main>
    </>
  );
};

export default BaseLayout;
