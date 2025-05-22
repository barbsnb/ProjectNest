import React, { createContext, useEffect, useState } from "react";
import client from "../axiosClient";

export const UserProjectsContext = createContext(null);

export const UserProjectsProvider = ({ children }) => {
  const [userProjects, setUserProjects] = useState([]);
  const [getUserProjects, setGetUserProjects] = useState(false);

  useEffect(() => {
    client
      .get("/api/project_list")
      .then((res) => {
        setUserProjects(res.data);
        setGetUserProjects(false);
        console.log("Fetched projects:", res.data);
      })
      .catch((error) => {
        console.error("Failed to fetch user projects:", error);
      });
  }, [getUserProjects]);

  return (
    <UserProjectsContext.Provider
      value={{ userProjects, setUserProjects, getUserProjects, setGetUserProjects }}
    >
      {children}
    </UserProjectsContext.Provider>
  );
};
