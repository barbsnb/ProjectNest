// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import client from '../axiosClient';
import { useNavigate } from 'react-router-dom';


export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [getCurrentUser, setGetCurrentUser] = useState(false);
    const [visit, setVisit] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        client.get("/api/user")
        .then(res => {
            setCurrentUser(res.data);
            navigate('/home');  
            setGetCurrentUser(false);
        })
        .catch(() => {
            setCurrentUser(null);
            setGetCurrentUser(false);
        });
    }, [getCurrentUser]);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, visit, setVisit, getCurrentUser, setGetCurrentUser}}>
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