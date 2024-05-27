// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import client from "../axiosClient";
import { useNavigate } from "react-router-dom";
import { UserVisitsContext } from "./UserVisitsContext";
import { AllVisitsContext } from "./AllVisitsContext";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
   const [currentUser, setCurrentUser] = useState(null);
   const [getCurrentUser, setGetCurrentUser] = useState(false);
   const [getAllVisits, setGetAllVisits] = useState(false);
   // const { setGetAllVisits } = useContext(AllVisitsContext)
   const [getUserVisits, setGetUserVisits] = useState(false);
   // const { setGetUserVisits } = useContext(UserVisitsContext)

   const navigate = useNavigate();

   useEffect(() => {
      client
         .get("/api/user")
         .then((res) => {
            setCurrentUser(res.data);
            if (res.data.user.is_receptionist) {
               navigate("/visit_list"); // Przekieruj na stronę Visit List jeśli użytkownik jest recepcjonistką
               setGetCurrentUser(false);
            } else {
               navigate("/home"); // W przeciwnym razie przekieruj na stronę Home
               setGetCurrentUser(false);
            }
         })
         .catch(() => {
            setCurrentUser(null);
            setGetCurrentUser(false);
         });
   }, [getCurrentUser]);

   return (
      <AuthContext.Provider
         value={{
            currentUser,
            setCurrentUser,
            getCurrentUser,
            setGetCurrentUser,
            getAllVisits,
            setGetAllVisits,
            getUserVisits,
            setGetUserVisits,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};

// import React, { createContext, useState, useEffect } from 'react';
// import client from '../axiosClient';
// import { useNavigate } from 'react-router-dom';

// export const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [currentUser, setCurrentUser] = useState(null);
//     const [visit, setVisit] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         client.get("/api/user")
//         .then(res => setCurrentUser(res.data))
//         .catch(() => setCurrentUser(null));
//     }, []);

//     return (
//         <AuthContext.Provider value={{ currentUser, setCurrentUser, visit, setVisit}}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// useEffect(() => {
//     const fetchUserData = async () => {
//         try {
//             const res = await client.get("/api/user");
//             setCurrentUser(res.data);
//             navigate('/home'); // Przejdź do widoku Home po pobraniu danych użytkownika
//         } catch (error) {
//             console.error('Failed to fetch user data:', error);
//             setCurrentUser(null);
//         }
//     };

//     fetchUserData();
// }, [navigate]);
