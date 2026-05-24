import React, { createContext, useEffect, useState } from "react";

import client from "../axiosClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [getCurrentUser, setGetCurrentUser] = useState(false);
  const [getUserProjects, setGetUserProjects] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setAuthLoading(true);

    client
      .get("/api/user")
      .then((res) => {
        if (!isMounted) return;
        setCurrentUser(res.data.user);
      })
      .catch(() => {
        if (!isMounted) return;
        window.localStorage.removeItem("praetorAuthToken");
        setCurrentUser(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setAuthLoading(false);
        if (getCurrentUser) {
          setGetCurrentUser(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authLoading,
        getCurrentUser,
        setGetCurrentUser,
        getUserProjects,
        setGetUserProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
