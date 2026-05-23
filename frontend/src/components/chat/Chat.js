import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import client from "../../axiosClient";
import "./Chat.css";

const Chat = ({ projectId }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const loadExistingSession = async () => {
      if (!projectId) return;

      try {
        const response = await client.get(`/api/chat/project/${projectId}/session/`);
        const session = response.data;
        setSessionId(session.session_id);
        fetchMessages(session.session_id);
      } catch (error) {
        console.error("Chat session not found:", error);
      }
    };

    loadExistingSession();
  }, [projectId]);

  const fetchMessages = async (nextSessionId) => {
    try {
      const response = await client.get(`/api/chat/sessions/${nextSessionId}/messages/`);
      const formatted = response.data.map((msg) => ({
        from: msg.role === "user" ? "user" : "assistant",
        text: msg.content,
      }));
      setMessages(formatted);
    } catch (error) {
      console.error("Message loading failed:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");

    try {
      const response = await client.post(`/api/chat/sessions/${sessionId}/messages/`, {
        content: userText,
      });

      const { assistant_message } = response.data;
      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: assistant_message.content,
        },
      ]);
    } catch (error) {
      console.error("Message sending failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: "Wystapil blad podczas komunikacji z serwerem.",
        },
      ]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.from}`}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <textarea
          placeholder="Wpisz pytanie..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="chat-input"
        />
        <button onClick={handleSend} className="chat-send-btn" disabled={!sessionId}>
          Wyslij
        </button>
      </div>
    </div>
  );
};

export default Chat;
