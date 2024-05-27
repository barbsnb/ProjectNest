import React, { createContext, useEffect, useState } from "react";
import client from "../axiosClient";
// import axios from 'axios';

export const UserVisitsContext = createContext(null);

export const UserVisitsProvider = ({ children }) => {
  const [userVisits, setUserVisits] = useState([]);
  const [getUserVisits, setGetUserVisits] = useState(false);

   useEffect(() => {
      if (getUserVisits) {
         client
            .get("/api/visit_list")
            .then((res) => {
               const fetchExtensionStatus = async (visits) => {
                  const visitsWithExtensionStatus = await Promise.all(
                     visits.map(async (visit) => {
                        let extensionStatus = "Brak";

                        try {
                           const extensionResponse = await client.get(
                              `/api/all_extension_request_list`
                           );
                           console.log(extensionResponse);
                           const extension = extensionResponse.data.find(
                              (ext) => ext.visit === visit.id
                           );
                           if (extension) {
                              extensionStatus = extension.status;
                           }
                        } catch (error) {
                           console.error(
                              "Error fetching extension status:",
                              error
                           );
                        }
                        console.log();
                        return { ...visit, extensionStatus };
                     })
                  );
                  setUserVisits(visitsWithExtensionStatus);
               };

               fetchExtensionStatus(res.data);
               setGetUserVisits(false);
               console.log(res.data);
            })
            .catch((error) => {
               console.error("Failed to fetch user visits:", error);
            });
      }
   }, [getUserVisits]);

   return (
      <UserVisitsContext.Provider
         value={{ userVisits, setUserVisits, getUserVisits, setGetUserVisits }}
      >
         {children}
      </UserVisitsContext.Provider>
   );
};
