import React, { useEffect, useState } from "react";
import { Container, Badge, Card, Spinner, Alert } from "react-bootstrap";
import "./ProjectSuggestions.css";


const statusLabels = {
  new: "Nowa",
  in_progress: "W trakcie",
  done: "Zrealizowana",
};

const ProjectSuggestions = ({ projectId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    fetch(`http://127.0.0.1:8000/api/improvement-suggestions/${projectId}/`, {
    credentials: 'include',
    headers: {
        'Accept': 'application/json',
    },
    })

    .then(res => {
        console.log('Status:', res.status, 'Content-Type:', res.headers.get('Content-Type'));
        if (!res.ok) {
        throw new Error(`Błąd podczas pobierania sugestii: ${res.status}`);
        }
        const contentType = res.headers.get('Content-Type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
        return res.json();
        }
        throw new Error('Otrzymano nie-JSONową odpowiedź z serwera');
    })
    .then(data => {
        setSuggestions(data);
        setLoading(false);
    })
    .catch(err => {
        setError(err.message);
        setLoading(false);
    });

  }, [projectId]);

  if (loading) {
    return (
      <Container className="suggestion-container mt-3 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="suggestion-container mt-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Container className="suggestion-container mt-3">
        <h3 className="suggestion-header">Sugestie ulepszeń</h3>
        <p className="suggestion-content">Brak danych.</p>
      </Container>
    );
  }

  // Sortuj sugestie wg priorytetu: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedSuggestions = [...suggestions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <Container className="suggestion-container mt-3">
      <h3 className="suggestion-header">Sugestie ulepszeń</h3>
      {sortedSuggestions.map((suggestion) => (
        <Card
        key={suggestion.id}
        className="mb-3 section-card"
        >
          <Card.Body>
            <Card.Title>
              {suggestion.title}{" "}
                <Badge className={`priority-badge ${suggestion.priority}`}>
                 {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                </Badge>
            </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              Status: <Badge bg="info">{statusLabels[suggestion.status]}</Badge>
            </Card.Subtitle>
            <Card.Text>
              <strong>Opis:</strong> {suggestion.description}
            </Card.Text>
            <Card.Text>
              <strong>Rekomendacje:</strong> {suggestion.recommendations}
            </Card.Text>
            <Card.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
              Utworzono: {new Date(suggestion.created_at).toLocaleDateString()}
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default ProjectSuggestions;
