import React, { createContext, useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatStarted, setChatStarted] = useState(false);
  const [projectData, setProjectData] = useState(null);

  return (
    <ChatContext.Provider value={{ chatStarted, setChatStarted, projectData, setProjectData  }}>
      {children}
    </ChatContext.Provider>
  );
};
