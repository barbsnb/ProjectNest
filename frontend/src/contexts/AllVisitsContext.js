import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../axiosClient';
// import axios from 'axios';

export const AllVisitsContext = createContext(null);

export const AllVisitsProvider = ({ children }) => {
  const [AllVisits, setAllVisits] = useState([]);
  const [getAllVisits, setGetAllVisits] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/api/all_visit_list")
    .then(res => {
        setAllVisits(res.data);
        setGetAllVisits(false);
        console.log(res.data)
    })
    .catch(error => {
        console.error('Failed to fetch all visits:', error)
    });
}, [getAllVisits]);

  return (
    <AllVisitsContext.Provider value={{AllVisits, setAllVisits, getAllVisits, setGetAllVisits}}>
      {children}
    </AllVisitsContext.Provider>
  );
};
