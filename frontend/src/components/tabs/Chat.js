import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../contexts/ChatContext";
import "./Chat.css";

const Chat = () => {
  const { projectData } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (projectData) {
      simulateAssistantResponse();
    }
  }, [projectData]);

  const simulateAssistantResponse = () => {
    const initialMessages = [
      { from: "assistant", text: `Witaj! Oto Twoje przesłane dane:` },
      {
        from: "assistant",
        text: `📁 **Nazwa projektu:** ${projectData.name}\n📝 **Opis:** ${projectData.description}`,
      },
      {
        from: "assistant",
        text: `🔍 Rozpoczynam analizę projektu...`,
      },
      {
        from: "assistant",
        text: `✅ Na pierwszy rzut oka projekt wygląda interesująco! Czy chcesz przeanalizować jakość kodu, dokumentację czy może UX?`,
      },
    ];

    setMessages(initialMessages);
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.from === "assistant" ? "assistant" : "user"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
