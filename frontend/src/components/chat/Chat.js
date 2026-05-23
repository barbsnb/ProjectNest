import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Spinner } from "react-bootstrap";
import { SendHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";

import client from "../../axiosClient";
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
      console.error("Message loading failed:", error);
      setError("Nie udalo sie pobrac historii rozmowy.");
    }
  }, []);

  const createSession = useCallback(async () => {
    const response = await client.post("/api/chat/sessions/", {
      project_id: projectId,
      title: "Report assistant",
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
        console.error("Chat session loading failed:", error);
        setError("Nie udalo sie przygotowac asystenta dla tego projektu.");
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSession();
  }, [createSession, fetchMessages, projectId]);

  useEffect(() => {
    if (!activeContext) return;

    setInput((current) => current || "Wyjasnij, dlaczego to jest problem i jak naprawic go krok po kroku.");
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
      console.error("Message sending failed:", error);
      setError("Nie udalo sie wyslac pytania. Sprobuj ponownie za chwile.");
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          from: "assistant",
          text: "Nie moge teraz odpowiedziec. Historia rozmowy pozostala bezpieczna, a raport nadal jest dostepny.",
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
          <p>Report assistant</p>
          <h2>Ask about the audit</h2>
        </div>
        {isLoadingSession && (
          <span className="chat-loading-label">
            <Spinner animation="border" size="sm" />
            Preparing context
          </span>
        )}
      </div>

      {activeContext && (
        <section className="assistant-context-card">
          <div>
            <span>Current context</span>
            <h3>{activeContext.title}</h3>
          </div>
          <div className="assistant-context-meta">
            <Badge bg={severityVariant[activeContext.severity] || "secondary"}>{activeContext.severity}</Badge>
            <span>{activeContext.category}</span>
            <code>{activeContext.file_path || "repository"}{activeContext.line_start ? `:${activeContext.line_start}` : ""}</code>
          </div>
        </section>
      )}

      {error && <Alert variant="warning" className="chat-alert">{error}</Alert>}

      <div className="chat-box">
        {messages.length === 0 && !isLoadingSession && (
          <div className="chat-empty-state">
            <strong>No conversation yet.</strong>
            <p>Ask about a finding, the latest report, or the safest next remediation step.</p>
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
            Reading report context...
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <textarea
          placeholder={activeContext ? "Ask how to understand or fix this finding..." : "Ask about the latest audit report..."}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="chat-input"
          disabled={!sessionId || isSending}
        />
        <button onClick={handleSend} className="chat-send-btn" disabled={!sessionId || !input.trim() || isSending}>
          {isSending ? <Spinner animation="border" size="sm" /> : <SendHorizontal size={17} />}
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
