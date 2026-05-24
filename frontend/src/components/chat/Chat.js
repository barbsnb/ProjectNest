import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Spinner } from "react-bootstrap";
import { SendHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";

import client from "../../axiosClient";
import { categoryLabels, labelOrValue, severityLabels } from "../../utils/auditLabels";
import "./Chat.css";

const severityVariant = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "secondary",
  info: "info",
};

const formatMessage = (msg) => ({
  id: msg.id,
  from: msg.role === "user" ? "user" : "assistant",
  text: msg.content,
  findingId: msg.finding,
  analysisRunId: msg.analysis_run,
  timestamp: msg.timestamp,
});

const Chat = ({ projectId, findingContext }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const activeContext = useMemo(() => findingContext || null, [findingContext]);

  const fetchMessages = useCallback(async (nextSessionId) => {
    try {
      const response = await client.get(`/api/chat/sessions/${nextSessionId}/messages/`);
      setMessages(response.data.map(formatMessage));
    } catch (error) {
      console.error("Nie udało się pobrać wiadomości:", error);
      setError("Nie udało się pobrać historii rozmowy.");
    }
  }, []);

  const createSession = useCallback(async () => {
    const response = await client.post("/api/chat/sessions/", {
      project_id: projectId,
      title: "Asystent raportu",
    });
    return response.data;
  }, [projectId]);

  useEffect(() => {
    const loadSession = async () => {
      if (!projectId) return;

      setIsLoadingSession(true);
      setError("");
      try {
        let session;
        try {
          const response = await client.get(`/api/chat/project/${projectId}/session/`);
          session = response.data;
        } catch (error) {
          if (error.response?.status !== 404) {
            throw error;
          }
          session = await createSession();
        }

        setSessionId(session.session_id);
        await fetchMessages(session.session_id);
      } catch (error) {
        console.error("Nie udało się przygotować sesji czatu:", error);
        setError("Nie udało się przygotować asystenta dla tego projektu.");
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSession();
  }, [createSession, fetchMessages, projectId]);

  useEffect(() => {
    if (!activeContext) return;

    setInput((current) => current || "Wyjaśnij, dlaczego to jest problem i jak naprawić go krok po kroku.");
  }, [activeContext]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isSending) return;

    const userText = input.trim();
    const optimisticMessage = {
      id: `local-${Date.now()}`,
      from: "user",
      text: userText,
      findingId: activeContext?.id || null,
      analysisRunId: activeContext?.run || null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const payload = {
        content: userText,
      };
      if (activeContext?.id) payload.finding_id = activeContext.id;
      if (activeContext?.run) payload.analysis_run_id = activeContext.run;

      const response = await client.post(`/api/chat/sessions/${sessionId}/messages/`, payload);
      const { assistant_message } = response.data;
      setMessages((prev) => [...prev, formatMessage(assistant_message)]);
    } catch (error) {
      console.error("Nie udało się wysłać wiadomości:", error);
      setError("Nie udało się wysłać pytania. Spróbuj ponownie za chwilę.");
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          from: "assistant",
          text: "Nie mogę teraz odpowiedzieć. Historia rozmowy pozostała bezpieczna, a raport nadal jest dostępny.",
        },
      ]);
    } finally {
      setIsSending(false);
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
      <div className="chat-header">
        <div>
          <p>Asystent raportu</p>
          <h2>Zapytaj o audyt</h2>
        </div>
        {isLoadingSession && (
          <span className="chat-loading-label">
            <Spinner animation="border" size="sm" />
            Przygotowuję kontekst
          </span>
        )}
      </div>

      {activeContext && (
        <section className="assistant-context-card">
          <div>
            <span>Bieżący kontekst</span>
            <h3>{activeContext.title}</h3>
          </div>
          <div className="assistant-context-meta">
            <Badge bg={severityVariant[activeContext.severity] || "secondary"}>
              {labelOrValue(severityLabels, activeContext.severity)}
            </Badge>
            <span>{labelOrValue(categoryLabels, activeContext.category)}</span>
            <code>{activeContext.file_path || "repozytorium"}{activeContext.line_start ? `:${activeContext.line_start}` : ""}</code>
          </div>
        </section>
      )}

      {error && <Alert variant="warning" className="chat-alert">{error}</Alert>}

      <div className="chat-box">
        {messages.length === 0 && !isLoadingSession && (
          <div className="chat-empty-state">
            <strong>Brak rozmowy.</strong>
            <p>Zapytaj o wynik audytu, najnowszy raport albo najbezpieczniejszy kolejny krok naprawczy.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id || `${msg.from}-${msg.timestamp}`} className={`message ${msg.from}`}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}

        {isSending && (
          <div className="message assistant pending">
            <Spinner animation="border" size="sm" />
            Czytam kontekst raportu...
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <textarea
          placeholder={activeContext ? "Zapytaj, jak zrozumieć lub naprawić ten problem..." : "Zapytaj o najnowszy raport audytu..."}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="chat-input"
          disabled={!sessionId || isSending}
        />
        <button onClick={handleSend} className="chat-send-btn" disabled={!sessionId || !input.trim() || isSending}>
          {isSending ? <Spinner animation="border" size="sm" /> : <SendHorizontal size={17} />}
          Wyślij
        </button>
      </div>
    </div>
  );
};

export default Chat;
