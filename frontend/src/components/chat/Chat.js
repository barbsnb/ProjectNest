import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Chat.css";
import ReactMarkdown from "react-markdown";

const Chat = ({ projectId }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (projectId) {
      loadExistingSession();
    }
  }, [projectId]);

  const loadExistingSession = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/chat/project/${projectId}/session/`);
      const session = response.data;
      setSessionId(session.session_id);
      fetchMessages(session.session_id);
    } catch (error) {
      console.error("Nie znaleziono sesji czatu:", error);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/chat/sessions/${sessionId}/messages/`);
      const formatted = response.data.map((msg) => ({
        from: msg.role === "user" ? "user" : "assistant",
        text: msg.content,
      }));
      setMessages(formatted);
    } catch (error) {
      console.error("Błąd pobierania wiadomości:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userText = input.trim();

    // Dodaj tymczasowo wiadomość użytkownika
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/api/chat/sessions/${sessionId}/messages/`,
        { content: userText }
      );

      // Odpowiedź zawiera wiadomość użytkownika i asystenta
      const { assistant_message } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: assistant_message.content,
        },
      ]);
    } catch (error) {
      console.error("Błąd podczas wysyłania wiadomości:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: "❌ Wystąpił błąd podczas komunikacji z serwerem.",
        },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="chat-input"
        />
        <button onClick={handleSend} className="chat-send-btn">
          Wyślij
        </button>
      </div>
    </div>
  );
};

export default Chat;
