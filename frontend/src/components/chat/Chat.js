import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../contexts/ChatContext";
import "./Chat.css";

const initialAnalysis = `
🧠 **Analiza projektu: ToDoApp – aplikacja do zarządzania zadaniami**

📌 Nazwa projektu: ToDoApp  
👨‍💻 Technologie: React.js, Node.js (Express), MongoDB

✅ Co działa dobrze – plusy projektu:
- Przejrzysta funkcjonalność CRUD.
- Pełen stos MERN.
- Rejestracja/logowanie.
- Responsywny design.

⚠️ Co można poprawić / rozwinąć:
- Brak testów jednostkowych (Jest, React Testing Library).
- Brak zarządzania stanem globalnym (Redux, Zustand).
- UI/UX do unowocześnienia (Tailwind CSS, Material UI).
- Obsługa błędów i komunikaty dla użytkownika.
- Bezpieczeństwo: hash haseł (bcrypt), JWT.

🚀 Sugestie rozwoju:
- Powiadomienia i deadline’y.
- PWA.
- Dashboard z wykresami.
- Tryb ciemny.
- OAuth (logowanie przez Google).

📈 Trendy w ofertach pracy:
- React + TypeScript
- Tailwind CSS, Zustand, React Query
- Testowanie (Jest, Cypress)
- DevOps (Docker, CI/CD)

Przykładowa oferta: https://jobs.fakejobs.pl/frontend-react-ts-tailwind
`;

const Chat = ({ projectId }) => {
  const { projectData } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

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
        text: `📁 Nazwa projektu: ${projectData.name}\n📝 Opis: ${projectData.description}`,
      },
      {
        from: "assistant",
        text: `🔍 Rozpoczynam analizę projektu...`,
      },
      { from: "assistant", text: initialAnalysis },
      {
        from: "assistant",
        text: `Masz pytania do analizy? Śmiało wpisz je poniżej!`,
      },
    ];

    setMessages(initialMessages);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input.trim() };
    setMessages((msgs) => [...msgs, userMessage]);

    // Prosta symulacja odpowiedzi asystenta (można rozbudować)
    setTimeout(() => {
      const assistantReply = {
        from: "assistant",
        text: `Dziękuję za pytanie: "${input.trim()}". Aktualnie jestem w trybie demo i nie potrafię jeszcze na nie odpowiedzieć, ale pracuję nad tym!`,
      };
      setMessages((msgs) => [...msgs, assistantReply]);
    }, 1000);

    setInput("");
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
          <div
            key={idx}
            className={`message ${msg.from === "assistant" ? "assistant" : "user"}`}
          >
            {msg.text.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
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
