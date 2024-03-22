import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../axiosClient';
// import axios from 'axios';

export const AllRequestContext = createContext(null);

export const AllRequestsProvider = ({ children }) => {
  const [AllRequests, setAllRequests] = useState([]);
  const [getAllRequests, setGetAllRequests] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/api/all_extension_request_list")
    .then(res => {
        setAllRequests(res.data);
        setGetAllRequests(false);
        console.log(res.data)
    })
    .catch(error => {
        console.error('Failed to fetch all visits:', error);
    });
  }, [getAllRequests]);

  return (
    <AllRequestContext.Provider value={{AllRequests, setAllRequests, getAllRequests, setGetAllRequests}}>
      {children}
    </AllRequestContext.Provider>
  );
};
