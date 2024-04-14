// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import client from '../axiosClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [visit, setVisit] = useState(null);

    useEffect(() => {
        client.get("/api/user")
        .then(res => setCurrentUser(res.data))
        .catch(() => setCurrentUser(null));
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, visit, setVisit}}>
            {children}
        </AuthContext.Provider>
    );
};
