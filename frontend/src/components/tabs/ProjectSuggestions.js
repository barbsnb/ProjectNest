import React, { useEffect, useState } from "react";
import { Alert, Badge, Card, Container, Spinner } from "react-bootstrap";

import client from "../../axiosClient";
import { labelOrValue, priorityLabels } from "../../utils/auditLabels";
import "./ProjectSuggestions.css";

const statusLabels = {
  new: "Nowa",
  in_progress: "W trakcie",
  done: "Zrealizowana",
};

const priorityOrder = { high: 0, medium: 1, low: 2 };

const ProjectSuggestions = ({ projectId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);

      try {
        const [projectResponse, suggestionsResponse] = await Promise.all([
          client.get(`/api/projects/${projectId}/`),
          client.get(`/api/improvement-suggestions/${projectId}/`),
        ]);

        setProject(projectResponse.data);
        setSuggestions(suggestionsResponse.data);
      } catch (error) {
        setError("Nie udało się pobrać sugestii dla tego projektu.");
        console.error("Nie udało się pobrać sugestii:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <h3 className="suggestion-header">Sugestie ulepszeń: {project ? project.name : "(ładowanie...)"}</h3>
        <p className="suggestion-content">Brak danych.</p>
      </Container>
    );
  }

  const sortedSuggestions = [...suggestions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <Container className="suggestion-container mt-3">
      <h3 className="suggestion-header">Sugestie ulepszeń: {project ? project.name : "(ładowanie...)"}</h3>
      {sortedSuggestions.map((suggestion) => (
        <Card key={suggestion.id} className="mb-3 section-card">
          <Card.Body>
            <Card.Title>
              {suggestion.title}{" "}
              <Badge className={`priority-badge ${suggestion.priority}`}>
                {labelOrValue(priorityLabels, suggestion.priority)}
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
