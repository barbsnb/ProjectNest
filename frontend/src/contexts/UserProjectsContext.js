import React, { createContext, useContext, useEffect, useState } from "react";

import client from "../axiosClient";
import { AuthContext } from "./AuthContext";

export const UserProjectsContext = createContext(null);

export const UserProjectsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [userProjects, setUserProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [getUserProjects, setGetUserProjects] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setUserProjects([]);
      setProjectsLoading(false);
      setProjectsError("");
      return;
    }

    setProjectsLoading(true);
    setProjectsError("");

    client
      .get("/api/project_list/")
      .then((res) => {
        setUserProjects(res.data);
      })
      .catch((error) => {
        console.error("Nie udało się pobrać projektów użytkownika:", error);
        setProjectsError("Nie udało się pobrać projektów.");
      })
      .finally(() => {
        setProjectsLoading(false);
        if (getUserProjects) {
          setGetUserProjects(false);
        }
      });
  }, [currentUser, getUserProjects]);

  return (
    <UserProjectsContext.Provider
      value={{
        userProjects,
        setUserProjects,
        projectsLoading,
        projectsError,
        getUserProjects,
        setGetUserProjects,
      }}
    >
      {children}
    </UserProjectsContext.Provider>
  );
};
