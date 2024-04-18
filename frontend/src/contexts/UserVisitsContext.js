import React, { createContext, useEffect, useState } from 'react';
import client from '../axiosClient';
// import axios from 'axios';

export const UserVisitsContext = createContext(null);

export const UserVisitsProvider = ({ children }) => {
  const [userVisits, setUserVisits] = useState([]);
  const [getUserVisits, setGetUserVisits] = useState(false);

  useEffect(() => {
    client.get("/api/visit_list")
    .then(res => {
        setUserVisits(res.data);
        setGetUserVisits(false);
        console.log(res.data)
    })
    .catch(error => {
        console.error('Failed to fetch user visits:', error)
    });
}, [getUserVisits]);

  return (
    <UserVisitsContext.Provider value={{userVisits, setUserVisits, getUserVisits, setGetUserVisits}}>
      {children}
    </UserVisitsContext.Provider>
  );
};

//   useEffect(() => {
//     const fetchUserVisits = async () => {
//       try {
//         const response = await axios.get('/api/visit_list');
//         setUserVisits(response.data);
//       } catch (error) {
//         console.error('Failed to fetch user visits:', error);
//       }
//     };

//     fetchUserVisits();
//   }, []);