// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import client from "../axiosClient";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
   const [currentUser, setCurrentUser] = useState(null);
   const [getCurrentUser, setGetCurrentUser] = useState(false);
   const [getUserProjects, setGetUserProjects] = useState(false);

   const navigate = useNavigate();

   useEffect(() => {
      client
         .get("/api/user")
         .then((res) => {
            setCurrentUser(res.data);
            navigate("/home"); // W przeciwnym razie przekieruj na stronę Home
            setGetCurrentUser(false);
         })
         .catch(() => {
            setCurrentUser(null);
            setGetCurrentUser(false);
         });
   }, [getCurrentUser, navigate]);

   return (
      <AuthContext.Provider
         value={{
            currentUser,
            setCurrentUser,
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

