import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, authLoading } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading) {
    return <div className="route-loading">Ładowanie przestrzeni roboczej...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
